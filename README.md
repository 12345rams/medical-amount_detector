# Medical Amount Detection API

## Run
npm install
npm start

## Endpoints

- POST /extract/text  — JSON body `{ "text": "..." }`
- POST /extract/image — multipart form `image` file (returns OCR -> normalize -> classify)

## Notes
- Uploads are stored temporarily in `uploads/` by `multer`.
