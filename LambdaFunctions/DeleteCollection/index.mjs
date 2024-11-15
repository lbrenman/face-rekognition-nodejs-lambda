import { RekognitionClient, DeleteCollectionCommand } from "@aws-sdk/client-rekognition";

const client = new RekognitionClient({ region: "us-east-1" });

export const handler = async (event) => {
    const body = JSON.parse(event.body);
    const collectionId = event.queryStringParameters?.collectionId;

    if (!collectionId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing collectionId in request body" }),
            headers: {
                'Content-Type': 'application/json',
                "Access-Control-Allow-Origin": "*"
            }
        };
    }

    const params = {
        CollectionId: collectionId
    };

    try {
        const command = new DeleteCollectionCommand(params);
        const response = await client.send(command);
        return {
            statusCode: 200,
            body: JSON.stringify(response),
            headers: {
                'Content-Type': 'application/json',
                "Access-Control-Allow-Origin": "*"
            }
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to delete collection' }),
            headers: {
                'Content-Type': 'application/json',
                "Access-Control-Allow-Origin": "*"
            }
        };
    }
};