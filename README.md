# What's this?

- You can easily run APIs for various services that convert speech to text.
- You can also check out the sample TypeScript code that actually works.

# How to Use

1. To use each API, you need to create an `.env` file and write the credential information in it. See the `.env.example` file.
2. Place the audio files in the `test_data` directory.
3. Run the following command.

```bash
# install dependencies
yarn install

# display help
yarn start -h

# command format
yarn start <apiType> <filePath>

# for example
yarn start gcp test_data/test.wav
```

4. The transcription result will be displayed in the console. You can also see the details in the JSON saved in the `output` directory.

## Cloud Speech-to-Text (Google Cloud Platform)

Official Demo Page: https://cloud.google.com/speech-to-text

1. Download the credentials file from Google Cloud Platform and place it under the `.credentials` directory.

2. Write the credentials path in `.env`.

```.env
GOOGLE_APPLICATION_CREDENTIALS=".credentials/XXXXX.json"
```

3. Run the following command.

```bash
yarn start gcp test_data/test.wav
```

#### Note

If the file is larger than 10MB, it needs to be uploaded to Cloud Storage, so the following environment variables are also required.

```.env
GOOGLE_BUCKET_NAME="XXXXX"
```

## Amazon Transcribe (Amazon Web Services)

Official Page: https://aws.amazon.com/transcribe/

1. Write credential information and other in `.env`.

```.env
AWS_ACCESS_KEY_ID="XXXXX"
AWS_SECRET_ACCESS_KEY="XXXXX"
AWS_REGION="ap-northeast-1"
AWS_BUCKET_NAME="XXXXX"
```

2. Run the following command.

```bash
yarn start aws test_data/test.wav
```

## Speech to Text (Microsoft Azure)

Official Demo Page: https://azure.microsoft.com/ja-jp/services/cognitive-services/speech-to-text

1. Write the subscription key in `.env`.

```.env
AZURE_SUBSCRIPTION_KEY="XXXXX"
AZURE_LOCATION="japaneast"
```

2. Run the following command.

```bash
yarn start azure test_data/test.wav
```

## AmiVoice

Official Demo Page: https://acp.amivoice.com/main/acp-demo/

1. Write the application key in `.env`.

```.env
AMIVOICE_APPKEY="XXXXX"
```

2. Run the following command.

```bash
yarn start amivoice test_data/test.wav
```
