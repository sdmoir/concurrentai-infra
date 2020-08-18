import * as k8s from "@pulumi/kubernetes";

import config from "../config";
import { provider } from "./provider";

export const secret = new k8s.core.v1.Secret(
  "concurrentai-do-registry-secret",
  {
    metadata: {
      name: "do-registry",
    },
    stringData: {
      ".dockerconfigjson": JSON.stringify({
        auths: {
          "registry.digitalocean.com": {
            auth: config.digitalocean.registryToken,
          },
        },
      }),
    },
    type: "kubernetes.io/dockerconfigjson",
  },
  {
    provider,
  }
);
