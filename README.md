# What's this?

- You can easily run APIs for various services that convert speech to text.
- You can also check out the sample TypeScript code that actually works.

# How To Use

1. To use each API, you need to create an `.env` file and write the credential information in it. See the `.env.example` file.

2. Place the audio files in the `test_data` directory.

## Cloud Speech-to-Text

Official Demo Page: https://cloud.google.com/speech-to-text

1. Download the credentials file from Google Cloud Platform and place it under the `.credentials` directory.

2. Write the credentials path in `.env`.

```.env
GOOGLE_APPLICATION_CREDENTIALS=".credentials/XXXXX.json"
```

3. Run the following command.

```bash
yarn ts-node src/cloud_speech_to_text.ts
```

## AmiVoice

Official Demo Page: https://acp.amivoice.com/main/acp-demo/

1. Write the application key in `.env`.

```.env
AMIVOICE_APPKEY="XXXXX"
```

2. Run the following command.

```bash
yarn ts-node src/amivoice.ts
```