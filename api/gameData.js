export default async function handler(req, res) {
  const placeId = req.query.placeId;

  if (!placeId) {
    return res.status(400).json({ error: "Paramètre 'placeId' manquant" });
  }

  try {
    const universeRes = await fetch(
      `https://apis.roblox.com/universes/v1/places/${placeId}/universe`
    );

    if (!universeRes.ok) {
      return res.status(universeRes.status).json({ error: "Universe API error" });
    }

    const universeData = await universeRes.json();
    const universeId = universeData.universeId;
    if (!universeId) {
      return res.status(404).json({ error: "UniverseId introuvable" });
    }

    const [votesRes, detailsRes] = await Promise.all([
      fetch(`https://games.roblox.com/v1/games/votes?universeIds=${universeId}`),
      fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`),
    ]);

    if (!votesRes.ok || !detailsRes.ok) {
      return res.status(502).json({ error: "Erreur récupération des données Roblox" });
    }

    const votesData = await votesRes.json();
    const detailsData = await detailsRes.json();

    const votes = votesData.data?.[0];
    const info = detailsData.data?.[0];

    if (!votes || !info) {
      return res.status(404).json({ error: "Aucune donnée trouvée" });
    }

    return res.status(200).json({
      placeId: Number(placeId),
      universeId,
      name: info.name,
      creatorName: info.creator?.name,
      playing: info.playing,
      visits: info.visits,
      favorites: info.favoritedCount,
      upVotes: votes.upVotes,
      downVotes: votes.downVotes,
      ratio:
        votes.upVotes + votes.downVotes > 0
          ? Math.round((votes.upVotes / (votes.upVotes + votes.downVotes)) * 100)
          : 0,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur interne", details: err.message });
  }
}
