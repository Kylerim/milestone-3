const { Client } = require("@elastic/elasticsearch");
const { PROD_IP, ELASTIC_PORT, GROUP_ID, LOCAL_IP } = require("../common.js");
const QuillDeltaToHtmlConverter =
    require("quill-delta-to-html").QuillDeltaToHtmlConverter;

const { convert } = require("html-to-text");
const client = new Client({
    node: "http://localhost:9200",
    auth: {
        username: "elastic",
        password: "kylerim123",
    },
});

exports.createIndex = async function (id, title, content) {
    const result = await client.index({
        refresh: true,
        index: "documents",
        id,
        document: {
            title: title,
            content: content,
        },
    });
    return result;
};

exports.deleteIndex = async function (id) {
    const result = await client.delete({
        refresh: true,
        index: "documents",
        id,
    });
    return result;
};

exports.updateIndex = async function (id, delta) {
    let converter = new QuillDeltaToHtmlConverter(delta, {});
    let html = converter.convert();
    const content = convert(html, {
        wordwrap: null,
    });
    // const content = toPlaintext(delta);
    console.log("Updating content", content);
    const result = await client.update({
        refresh: true,
        index: "documents",
        id: id,
        doc: {
            content: content,
        },
    });

    return result;
};

exports.searchIndex = async (req, res) => {
    if (!req.session.user) {
        //response.setHeader('X-CSE356', GROUP_ID);
        res.json({ error: true, message: "Not logged in" });
        return;
    }
    const query = req.query.q;
    console.log("Search query is", query);

    const result = await client.search({
        index: "documents",
        size: 10,
        query: {
            multi_match: {
                query: query,
                fields: ["title", "content"],
            },
        },
        highlight: {
            fields: {
                content: {},
                title: {},
            },
        },
    });
    console.log(result.hits.hits);
    const toSend = result.hits.hits.map((doc) => {
        return {
            id: doc._id,
            name: doc._source.title,
            snippet: doc.highlight.content[0] || "",
        };
    });
    res.json(toSend);
};

exports.suggestIndex = async (req, res) => {
    if (!req.session.user) {
        //response.setHeader('X-CSE356', GROUP_ID);
        res.json({ error: true, message: "Not logged in" });
        return;
    }
    const query = req.query.q;
    console.log("Suggest query is", query);
    const result = await client.search({
        index: "documents",
        suggest: {
            suggester: {
                text: query,
                term: {
                    field: "content",
                    suggest_mode: "always",
                    prefix_length: query.length,
                    min_word_length: query.length,
                    string_distance: "ngram",
                    sort: "frequency",
                },
            },
        },
    });
    console.log(result.suggest.suggester);
    const toSend = result.suggest.suggester[0].options.map((opt) => opt.text);
    res.json(toSend);
};

// curl -X PUT "localhost:9200/documents?pretty" -H 'Content-Type: application/json' -d'
// {
//   "settings": {
//     "number_of_shards": 1
//   },
//   "mappings": {
//     "properties": {
//       "title": { "type": "text", "analyzer":"english" }, "content": {"type": "text", "analyzer": "english"}
//     }
//   }
// }
// '

// POST documents/_search
// {
//   "suggest": {
//     "suggester" : {
//       "text": "ston",
//       "term" : {
//         "field" : "content",
//         "suggest_mode": "always",
//         "prefix_length": 3,
//         "min_word_length": 3,
//         "string_distance": "ngram",
//         "sort": "frequency"
//       }
//     }
//   }
// }
