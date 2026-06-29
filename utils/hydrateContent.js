"use strict";
const { Content, Subject } = require('../models/mysqlModel');

/**
 * @param {Array<{Content_id:number, score:number}>} ranked
 */

async function hydrateContents(ranked = []) {
    if (!ranked.length) return [];

    const ids = ranked.map((r) => r.content_id);
    const rows = await Content.findAll({
        where: { id: ids },
        include: [{
            model: Subject,
            as: 'subjects',
            attributes: ["id", "name"]
        }],
    })

    const map = new Map(rows.map((c) => [String(c.id), c.toJSON()]));

    return ranked
        .map((r) => {
            const c = map.get(String(r.content_id));
            return c ? {...c, score: r.score} : null;
        })
        .filter(Boolean);
}

module.exports = hydrateContents;