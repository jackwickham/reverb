npm install
zip -r lambda.zip *
aws lambda update-function-code --function-name reverb-skill --zip-file fileb://./lambda.zip