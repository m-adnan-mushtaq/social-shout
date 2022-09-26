const { db } = require("../config/admin");
const { populateAuthorHelper } = require("./utils");

// REF TO DOC
const shoutsRef = db.collection("shouts");
const commentsRef = db.collection("comments");

/**
 * @param {Number} currentPage  current page of query
 */
async function shoutsPaginationUtil(currentPage) {
    try {
        let totalDocs = (await shoutsRef.get()).size;
        if (totalDocs === 0) return { docs: [] };

        //extract pagination setup
        const { docsPerPage, queryOffset, ...setupObj } = paginationSetup(currentPage, totalDocs);
        //make relevant query
        const querySnapShot = await shoutsRef
            .orderBy("createdAt", "desc")
            .offset(queryOffset)
            .limit(docsPerPage)
            .get();
        console.log(querySnapShot.empty);
        return paginationQueryResponse(querySnapShot.docs, setupObj);
    } catch (error) {
        throw Error(error);
    }
}

/**
 * @param {Number} currentPage  current page of query
 * @param {string} shoutId  pass the id of shout whose comment you want to extract
 */

async function commentsPaginationUtil(currentPage, shoutId) {
    try {
        let totalDocs = (await commentsRef.get()).size;
        if (totalDocs === 0) return { docs: [] };

        //extract pagination setup
        const { docsPerPage, queryOffset, ...setupObj } = paginationSetup(currentPage, totalDocs);
        //make relevant query
        const querySnapShot = await commentsRef
            .orderBy("createdAt", "desc")
            .where("shoutId", "==", shoutId)
            .offset(queryOffset)
            .limit(docsPerPage)
            .get();
        console.log(querySnapShot.empty);
        return paginationQueryResponse(querySnapShot.docs, setupObj);
    } catch (error) {
        throw Error(error);
    }
}

function paginationSetup(currentPage, totalDocs) {
    let docsPerPage = 2; // 👈 TODO UPDATE  TO 5
    let totalPages = Math.round(totalDocs / docsPerPage);

    let setupObj = { currentPage, totalPages, totalDocs };
    //if page is in limit
    if (currentPage > 1) {
        setupObj.prevPage = currentPage - 1;
    }
    if (currentPage < totalPages) {
        setupObj.nextPage = currentPage + 1;
    }
    let queryOffset = (currentPage - 1) * docsPerPage;
    setupObj.queryOffset = queryOffset;
    setupObj.docsPerPage = docsPerPage;
    return setupObj;
}

async function paginationQueryResponse(docs, setupObj) {
    try {
        let docsArr = [];
        for await (const doc of docs) {
            let parsedData = await populateAuthorHelper(doc);
            docsArr.push(parsedData);
        }
        let docsObj = { ...setupObj };
        docsObj.docs = docsArr;
        return docsObj;
    } catch (error) {
        throw Error(error);
    }
}
module.exports = { shoutsPaginationUtil ,commentsPaginationUtil};
