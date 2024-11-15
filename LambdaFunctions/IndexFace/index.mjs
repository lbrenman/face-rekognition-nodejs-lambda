import { RekognitionClient, IndexFacesCommand } from "@aws-sdk/client-rekognition";
import { Buffer } from 'buffer';

const client = new RekognitionClient({ region: "us-east-1" });

export const handler = async (event) => {
    const body = JSON.parse(event.body);
    const { image, name, collectionId } = body;

    if (!image || !name || !collectionId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing image, name or collectionId in request body" }),
            headers: {
                'Content-Type': 'application/json',
                "Access-Control-Allow-Origin": "*"
            }
        };
    }

    // Decode base64 image
    const buffer = Buffer.from(image, 'base64');

    // Add image to Rekognition collection
    try {
        const indexFacesParams = {
            CollectionId: collectionId,
            Image: {
                Bytes: buffer
            },
            ExternalImageId: name
        };
        const indexFacesCommand = new IndexFacesCommand(indexFacesParams);
        const response = await client.send(indexFacesCommand);
        return {
            statusCode: 200,
            body: JSON.stringify(response),
            headers: {
                'Content-Type': 'application/json',
                "Access-Control-Allow-Origin": "*"
            }
        };
    } catch (error) {
        console.error("Error indexing faces: ", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to add image to collection' }),
            headers: {
                'Content-Type': 'application/json',
                "Access-Control-Allow-Origin": "*"
            }
        };
    }
};
