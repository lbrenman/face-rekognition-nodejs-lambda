import { RekognitionClient, DetectFacesCommand, SearchFacesByImageCommand } from "@aws-sdk/client-rekognition";
import sharp from 'sharp';

const rekognitionClient = new RekognitionClient({ region: "us-east-1" }); // Specify your region

export const handler = async (event) => {
    try {
        // Get the image from the event (assuming it's base64 encoded)
        const body = JSON.parse(event.body);
        const base64Image = body.image;
        const buffer = Buffer.from(base64Image, 'base64');
        const collectionId = body.collectionId;

        // Detect faces in the input image
        const detectFacesParams = {
            Image: {
                Bytes: buffer
            }
        };
        const detectFacesCommand = new DetectFacesCommand(detectFacesParams);
        const detectFacesResponse = await rekognitionClient.send(detectFacesCommand);
        const faceDetails = detectFacesResponse.FaceDetails;

        if (faceDetails.length === 0) {
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'No faces detected in the image.' }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }
        
        const croppedFaces = await cropFaces(buffer, faceDetails);
        console.log(`${croppedFaces.length} face(s) cropped from the image.`);
        
        // Step 4: Identify each cropped face from the indexed collection
        const results = [];
        for (const faceBuffer of croppedFaces) {
          // console.log('faceBuffer');
          // console.log(faceBuffer);
          const faceMatches = await searchFacesByImage(faceBuffer, collectionId);
          if (faceMatches.length > 0) {
            results.push({ face: faceMatches[0].Face });
          } else {
            results.push({ message: 'Face not identified' });
          }
        }
        
        // Return the results
        return {
          statusCode: 200,
          body: JSON.stringify(results),
        };
    
      } catch (error) {
        console.error('Error processing image:', error);
        return {
          statusCode: 500,
          body: JSON.stringify({ message: 'Error processing image', error: error.message }),
        };
      }

        /*
        // Search for the detected faces in the collection
        const searchFacesPromises = faceDetails.map(async (face) => {
            const searchFacesParams = {
                CollectionId: collectionId,
                FaceMatchThreshold: 90, // Adjust the threshold as needed
                Image: {
                    Bytes: buffer
                }
            };
            const searchFacesCommand = new SearchFacesByImageCommand(searchFacesParams);
            return rekognitionClient.send(searchFacesCommand);
        });

        const searchFacesResponses = await Promise.all(searchFacesPromises);

        // Prepare the response
        const result = searchFacesResponses.map((searchFacesResponse, index) => {
            return {
                detectedFace: faceDetails[index],
                matches: searchFacesResponse.FaceMatches
            };
        });

        return {
            statusCode: 200,
            body: JSON.stringify(result),
            headers: {
                'Content-Type': 'application/json'
            }
        };

    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' }),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }
    */
    
};

// Function to crop faces from the image using Sharp
async function cropFaces(imageBuffer, faceDetails) {
    const metadata = await sharp(imageBuffer).metadata();
    const croppedBuffers = [];
  
    for (const faceDetail of faceDetails) {
      const boundingBox = faceDetail.BoundingBox;
      
      // Convert bounding box coordinates to pixel values
      const left = Math.floor(boundingBox.Left * metadata.width);
      const top = Math.floor(boundingBox.Top * metadata.height);
      const width = Math.floor(boundingBox.Width * metadata.width);
      const height = Math.floor(boundingBox.Height * metadata.height);
  
      // Crop the image using Sharp and get buffer
      const croppedBuffer = await sharp(imageBuffer)
        .extract({ left, top, width, height })
        .toBuffer();
  
      // Add cropped buffer to array
      croppedBuffers.push(croppedBuffer);
    }
  
    return croppedBuffers;
  }

// Function to search faces from the Rekognition collection
async function searchFacesByImage(imageBuffer, collectionId) {
  console.log('searchFacesByImage');
  console.log(collectionId);
  console.log(imageBuffer);
  const params = {
    CollectionId: collectionId, // Replace with your Rekognition collection ID
    Image: { Bytes: imageBuffer },
    MaxFaces: 5, // Max faces to identify
    FaceMatchThreshold: 90, // Minimum match confidence level
  };

  try {
    const command = new SearchFacesByImageCommand(params);
    const result = await rekognitionClient.send(command);
    return result.FaceMatches; // Return matched faces
  } catch (error) {
    console.error('Error searching faces by image:', error);
    throw error;
  }
}
