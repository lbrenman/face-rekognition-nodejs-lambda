import { RekognitionClient, ListFacesCommand } from "@aws-sdk/client-rekognition";

const client = new RekognitionClient({ region: "us-east-1" });

export const handler = async (event) => {
    const collectionId = event.queryStringParameters?.collectionId;

    const params = {CollectionId: collectionId};

    try {
        const command = new ListFacesCommand(params);
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
            body: JSON.stringify({ error: 'Failed to list collections' }),
            headers: {
                'Content-Type': 'application/json',
                "Access-Control-Allow-Origin": "*"
            }
        };
    }
};
