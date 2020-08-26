ORG_NAME=$1
SERVICE_NAME=$2

# Create tenant and namespace
bin/pulsar-admin tenants create $ORG_NAME
bin/pulsar-admin namespaces create $ORG_NAME/$SERVICE_NAME

# Install the mongo sink connector
apt-get update && apt-get install wget -y
wget https://archive.apache.org/dist/pulsar/pulsar-2.6.0/connectors/pulsar-io-mongo-2.6.0.nar
mkdir connectors
mv pulsar-io-mongo-2.6.0.nar connectors

# Run the mongo sink connector
bin/pulsar-admin sinks localrun \
    --archive connectors/pulsar-io-mongo-2.6.0.nar \
    --tenant $ORG_NAME \
    --namespace $SERVICE_NAME \
    --name mongo-concurrentai-sink \
    --sink-config '{"mongoUri":"mongodb://concurrentai:concurrentai@host.docker.internal:27017","database": "$ORG_NAME","collection":"$SERVICE_NAME"}' \
    --inputs $ORG_NAME/$SERVICE_NAME/model-response