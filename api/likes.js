export default async function handler(req, res) {
  try {
    const universeId = "TON_UNIVERSE_ID_ICI"; // Remplace par ton UniverseId Roblox
    const response = await fetch(
      `https://games.roblox.com/v1/games/votes?universeIds=${universeId}`
    );
    const data = await response.json();

    res.status(200).json({
      likes: data.data[0].upVotes,
      downVotes: data.data[0].downVotes,
    });
  } catch (err) {
    res.status(500).json({ error: "Erreur proxy", details: err.message });
  }
}
