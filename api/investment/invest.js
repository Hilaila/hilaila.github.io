const { json, options, body, accessToken } = require('../../lib/http');
const { piMe } = require('../../lib/pi');
const { createClient } = require('@supabase/supabase-js');

function supabase() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return options(res);
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'METHOD_NOT_ALLOWED' });

  try {
    const data = await body(req);

    const token = accessToken(req, data);
    if (!token) return json(res, 401, { ok: false, error: 'MISSING_ACCESS_TOKEN' });
    const piUser = await piMe(token);

    const projetId = String(data.projetId || '').trim();
    const unitesSouhaitees = Number(data.unites);
    const piPaymentId = String(data.piPaymentId || '').trim();
    const piTxId = String(data.piTxId || '').trim();

    if (!projetId) return json(res, 400, { ok: false, error: 'MISSING_PROJET_ID' });
    if (!Number.isFinite(unitesSouhaitees) || unitesSouhaitees <= 0) {
      return json(res, 400, { ok: false, error: 'INVALID_UNITES' });
    }
    if (!piPaymentId || !piTxId) {
      return json(res, 400, { ok: false, error: 'PAYMENT_NOT_CONFIRMED' });
    }

    const db = supabase();

    // 1. Récupérer l'utilisateur
    let { data: user, error: userErr } = await db
      .from('gtc_users')
      .select('id')
      .eq('pi_uid', piUser.uid)
      .maybeSingle();
    if (userErr) throw userErr;

    if (!user) {
      const { data: newUser, error: createErr } = await db
        .from('gtc_users')
        .insert({ pi_uid: piUser.uid, pi_username: piUser.username || null })
        .select('id')
        .single();
      if (createErr) throw createErr;
      user = newUser;
    }

    // 2. Vérifier que le paiement existe bien et est complété
    const { data: paiement, error: paiementErr } = await db
      .from('gtc_paiements')
      .select('*')
      .eq('pi_payment_id', piPaymentId)
      .eq('pi_tx_id', piTxId)
      .maybeSingle();

    if (paiementErr) throw paiementErr;
    if (!paiement || paiement.statut !== 'complete') {
      return json(res, 400, { ok: false, error: 'PAYMENT_NOT_VERIFIED_IN_LEDGER' });
    }

    // 3. Vérifier la disponibilité des unités (verrouillage optimiste simple)
    const { data: uniteRow, error: uniteErr } = await db
      .from('gtc_unites_projet')
      .select('*')
      .eq('projet_id', projetId)
      .single();

    if (uniteErr) throw uniteErr;
    if (uniteRow.unites_disponibles < unitesSouhaitees) {
      return json(res, 400, { ok: false, error: 'INSUFFICIENT_UNITS_AVAILABLE' });
    }

    const montantGtcp = unitesSouhaitees * uniteRow.prix_unite_gtcp;

    // 4. Enregistrer la transaction
    const { data: transaction, error: txErr } = await db
      .from('gtc_transactions')
      .insert({
        from_user_id: user.id,
        to_user_id: null,
        type_tx: 'investissement_projet',
        montant_pi: paiement.montant_pi,
        token_type: 'GTCP',
        pi_tx_id: piTxId,
        description: `Investissement ${unitesSouhaitees} unités — projet ${projetId}`,
        metadata: { projetId, unites: unitesSouhaitees }
      })
      .select('*')
      .single();
    if (txErr) throw txErr;

    // 5. Enregistrer la part d'investissement
    const { data: part, error: partErr } = await db
      .from('gtc_parts_investissement')
      .insert({
        projet_id: projetId,
        investisseur_id: user.id,
        montant_gtcp: montantGtcp,
        unites: unitesSouhaitees,
        pourcentage_parts: (unitesSouhaitees / uniteRow.total_unites) * 100,
        transaction_id: transaction.id,
        statut: 'pilote_testnet',
        payment_statut: 'confirme',
        token_statut: 'non_emis'
      })
      .select('*')
      .single();
    if (partErr) throw partErr;

    // 6. Mettre à jour les unités disponibles/confirmées
    const { error: updateUniteErr } = await db
      .from('gtc_unites_projet')
      .update({
        unites_disponibles: uniteRow.unites_disponibles - unitesSouhaitees,
        unites_confirmees: uniteRow.unites_confirmees + unitesSouhaitees,
        updated_at: new Date().toISOString()
      })
      .eq('projet_id', projetId);
    if (updateUniteErr) throw updateUniteErr;

    // 7. Mettre à jour le montant collecté du projet
    const { data: projetActuel, error: projetReadErr } = await db
      .from('gtc_projets_collectifs')
      .select('collecte_gtcp')
      .eq('id', projetId)
      .single();
    if (projetReadErr) throw projetReadErr;

    const { error: updateProjetErr } = await db
      .from('gtc_projets_collectifs')
      .update({ collecte_gtcp: (projetActuel.collecte_gtcp || 0) + montantGtcp })
      .eq('id', projetId);
    if (updateProjetErr) throw updateProjetErr;

    return json(res, 200, {
      ok: true,
      success: true,
      part,
      montantGtcp,
      unitesSouhaitees
    });

  } catch (e) {
    return json(res, e.status || 500, { ok: false, error: e.message, details: e.data || undefined });
  }
};
