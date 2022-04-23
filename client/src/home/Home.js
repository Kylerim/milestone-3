import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
    endpointDocList,
    endpointCreateDoc,
    endpointDeleteDoc,
} from "../Common";

function Home() {
    const [docList, setDocList] = useState([]);
    const [docName, setDocName] = useState("");

    const fetchdocList = async () => {
        console.log("Fetching doc list...");
        const response = await fetch(endpointDocList, {
            method: "GET",
            credentials: "include",
        });
        if (response.error) {
            console.log("ERR:", response.message);
        }
        const docListIn = await response.json();
        if (docListIn.length > 0) {
            console.log(docListIn);
        } else {
            console.log("Emtpy Documents List");
        }
        setDocList(docListIn);
    };

    const fetchCreateDoc = async () => {
        // /collection/create', createDoc
        const sendData = { name: docName };
        const response = await fetch(endpointCreateDoc, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },

            //check piazza data type...
            body: JSON.stringify(sendData),
            credentials: "include",
        });

        const data = await response.json();
        console.log("[Created Doc Id]: ", data.docid);

        fetchdocList();
        console.log("Updating the list of documents...");
    };

    const fetchDeleteDoc = async (docid) => {
        console.log("fetchDeleteDoc");
        const sendData = { docid: docid };
        const response = await fetch(endpointDeleteDoc, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },

            //check piazza data type...
            body: JSON.stringify(sendData),
            credentials: "include",
        });
        const data = await response.json();
        console.log("[Deleted Doc]: ", data);
        fetchdocList();

        console.log("Updating the list of documents: ", docList);
    };

    useEffect(() => {
        fetchdocList();
    }, []);

    return (
        <div>
            <p>User Home Page</p>
            <br />
            {/* <input>Input Field</input> */}
            <input
                onChange={(e) => {
                    setDocName(e.target.value);
                }}
                required
            />
            <button
                onClick={() => {
                    fetchCreateDoc();
                }}
            >
                Create New Document
            </button>
            <ul>
                {docList.map((doc) => (
                    <li key={doc.id}>
                        <Link to={`/doc/edit/${doc.id}`}>
                            {doc.name} : {doc.id}
                        </Link>
                        <button
                            style={{ marginLeft: 20 }}
                            onClick={() => {
                                fetchDeleteDoc(doc.id);
                            }}
                        >
                            {" "}
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Home;
