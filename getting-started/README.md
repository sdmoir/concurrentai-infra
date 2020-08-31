# Getting Started

_This guide is a work in progress._

Running a local Concurrent.ai stack involves a lot of setup at the moment, but future improvements (like an infra CLI and API) will make this process a whole lot easier.

For those who want to take on an early adventure, here's how to get up and running...

## Local deployments via Minikube

### Pre-requisites

In order to deploy a Concurrent.ai stack locally, you must have the following installed:
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Minikube](https://kubernetes.io/docs/tasks/tools/install-minikube/)
  - For Mac users with [Homebrew](https://brew.sh/) installed, you can run: `brew install minikube`
- Pulumi
  - Sign up for an account (free)
  - Install the [Pulumi CLI](https://www.pulumi.com/docs/reference/cli/)
- [Node.js](https://nodejs.org/en/)

### Minikube setup

In a new terminal, create a Minikube cluster by running:
```bash
minikube start --memory 4096
```

Start the Kubernetes dashboard to verify that Minikube is running successfully:
```bash
minikube dashboard
```

### Pulsar + MongoDB setup

[Apache Pulsar](https://pulsar.apache.org/) is the pub/sub messaging technology that Concurrent.ai currently uses for streaming model requests.

[MongoDB](https://www.mongodb.com/) is a document database that is easy to get started with to view model responses.

In a new terminal, run:
```bash
cd getting-started

docker-compose up
```

Pulsar and MongoDB should now be running.

There is a little bit of extra preparation that we have to do for Pulsar – namely, creating a tenant and namespace that the Concurrent.ai stack will use for producing and consuming messages.

In a new terminal, run:
```bash
cd getting-started

docker-compose exec pulsar /bin/bash -c "/pulsar/initialize.sh <your_org_name> <your_ml_service-name>"
```

The values you set for `<your_org_name>` and `<your_ml_service_name>` here will need to match what you configure for the Concurrent.ai stack in subsequent steps.

You're almost ready to deploy a Concurrent.ai stack!

### Pulumi setup

If you haven't already, [sign up for a free Pulumi account](https://app.pulumi.com/signup) and [install the Pulumi CLI](https://www.pulumi.com/docs/get-started/install/).

Once you have an account, go to your account settings and create an access token. Copy the access token for the next step.

### Deploy Concurrent.ai

In a new terminal, initialize a new Pulumi project and stack:
```bash
cd core

pulumi stack init <your_pulumi_username>/concurrentai/minikube
```
Enter the Pulumi access token that you created in the previous step when prompted.

Install dependencies:
```bash
npm install
```

Next, within the `core/` directory, create a `concurrentai.json` configuration file and add its contents to the Pulumi stack config.

Example `concurrentai.json` file:
```json
{
  "organizationId": "your-org-name",
  "region": "us-east",
  "services": [
    {
      "id": "wine",
      "models": [
        {
          "id": "v1-0",
          "live": true,
          "type": "mlflow-docker",
          "config": {
            "image": "concurrentai/demo-models:sklearn_elasticnet_wine_v1.0"
          }
        },
        {
          "id": "v1-1",
          "type": "mlflow-docker",
          "config": {
            "image": "concurrentai/demo-models:sklearn_elasticnet_wine_v1.1"
          }
        }
      ]
    }
  ]
}
```

```bash
cat concurrentai.json | pulumi config set concurrentai
```

_Note: Concurrent.ai only supports MLflow docker images at the moment. Support for additional frameworks and languages coming soon._

Set the remaining Pulumi config values required for the stack:
```bash
pulumi config set isMinikube true
```

```bash
MINIKUBE_IP=$(minikube ssh "cat /etc/hosts | grep host.minikube.internal | cut -d$'\t' -f1")

pulumi config set --path pulsar.url pulsar://${MINIKUBE_IP/$'\r'/}:6650
```

And then finally:
```bash
pulumi up

# or

pulumi up -y  # to auto-confirm deployment
```

This may take a few minutes since the demo model Docker images are rather large.

Once the pulumi deployment is complete, you can set your current `kubectl` context for convenience:
```bash
kubectl get namespaces

# find the concurrentai-<your_org_name>-<random> namespace

kubectl config set-context --current --namespace concurrentai-<your_org_name>-<random>
```

Then check on the state of your Concurrent.ai stack!
```bash
kubectl get pods

kubectl get services
```

### Access Concurrent.ai

To make requests against the Concurrent.ai stack, you'll need to expose the service via Minikube:
```bash
minikube service -n concurrentai-<your_org_name>-<random> concurrentai-gateway --url
```

For the demo models, you can run the following script to make a sample curl request:
```bash
./getting-started/demo-inference-request.sh <minikube_service_port>
```
