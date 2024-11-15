import { RekognitionClient, SearchFacesByImageCommand } from "@aws-sdk/client-rekognition";

export const handler = async (event) => {
    const body = JSON.parse(event.body);
    const base64Image = body.image;
    const collectionId = body.collectionId;

    // Decode base64 image
    const buffer = Buffer.from(base64Image, 'base64');

    const client = new RekognitionClient({ region: "us-east-1" });

    const params = {
        CollectionId: collectionId,
        Image: {
            Bytes: buffer
        }
    };

    try {
        const command = new SearchFacesByImageCommand(params);
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
            body: JSON.stringify({ error: 'Failed to process image' }),
            headers: {
                'Content-Type': 'application/json',
                "Access-Control-Allow-Origin": "*"
            }
        };
    }

};
