const { Client } = require("@elastic/elasticsearch");
const express = require("express");
const bodyParser = require("body-parser");
const { PROD_IP, ELASTIC_PORT, GROUP_ID, LOCAL_IP } = require("./common.js");

const client = new Client({
    node: "http://localhost:9200",
    auth: {
        username: "elastic",
        password: "kylerim123",
    },
});
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// app.use(
//     session({
//         secret: "secret-key",
//         saveUninitialized: true,
//         resave: false,
//         store: sessionStore,
//         cookie: { secure: false },
//         expires: new Date(Date.now() + 1 * 86400 * 1000), //expire 1 day
//     })
// );

app.use(function (req, res, next) {
    res.setHeader("X-CSE356", GROUP_ID);
    next();
});

app.post("/index/create", async (req, res) => {
    const newtitle = req.body.title;
    const newContent = req.body.content;
    const id = req.body.id;

    // console.log("title", newtitle)
    try {
        const result = await client.index({
            refresh: true,
            index: "documents",
            id: id,
            document: {
                title: newtitle,
                content: newContent,
            },
        });
        res.json({ result });
    } catch (error) {
        res.json({ error });
    }
});

app.post("/index/update", async (req, res) => {
    const newContent = req.body.content;
    const id = req.body.id;

    console.log("Body", req.body);

    const result = await client.update({
        refresh: true,
        index: "documents",
        id: id,
        doc: {
            content: newContent,
        },
    });

    res.json({ result });
});

app.get("/index/search", async (req, res) => {
    const query = req.query.q;
    console.log("Search query is", query);

    const result = await client.search({
        index: "documents",
        query: {
            multi_match: {
                query: query,
                fields: ["title^2", "content"],
            },
        },
        highlight: {
            fields: {
                content: {},
            },
        },
    });

    const toSend = result.hits.hits.map((doc) => {
        return {
            id: doc._id,
            name: doc._source.title,
            snippet: doc.highlight.content,
        };
    });
    res.json(toSend);
});

app.get("/index/suggest", async (req, res) => {
    const query = req.query.q;
    console.log("Suggest query is", query);
    const result = await client.search({
        index: "documents",
        suggest: {
            gotsuggest: {
                text: query,
                term: { field: "content", suggest_mode: "always" },
            },
        },
    });
    res.json({
        result,
    });
});

app.listen(ELASTIC_PORT, LOCAL_IP, () =>
    console.log(`CSE356 Milestone 3: listening on port ${ELASTIC_PORT}`)
);

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
// async function run() {
//     // Let's start by indexing some data
//     await client.index({
//         index: 'documents',
//         document: {
//             title: 'Ned Stark',
//             quote: 'Winter is coming.'
//         }
//     });

//     await client.index({
//         index: 'documents',
//         document: {
//             character: 'Daenerys Targaryen',
//             quote: 'I am the blood of the dragon.'
//         }
//     });

//     await client.index({
//         index: 'documents',
//         document: {
//             character: 'Tyrion Lannister',
//             quote: 'A mind needs books like a sword needs a whetstone.'
//         }
//     });

//     // // here we are forcing an index refresh, otherwise we will not
//     // // get any result in the consequent search
//     await client.indices.refresh({ index: 'documents' })

//     // Let's search!
//     const result = await client.search({
//         index: 'documents',
//         query: {
//             match: { quote: 'winter' }
//         }
//     });

//     console.log(result.hits.hits)
// }

// run().catch(console.log);
