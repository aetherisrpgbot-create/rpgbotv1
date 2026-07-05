const cache = new Map();

async function getGroupMetadata(sock, groupId) {
    const cached = cache.get(groupId);

    if (cached && (Date.now() - cached.timestamp) < 60000) {
        return cached.data;
    }

    const metadata = await sock.groupMetadata(groupId);

    cache.set(groupId, {
        data: metadata,
        timestamp: Date.now()
    });

    return metadata;
}

module.exports = {
    getGroupMetadata
};
