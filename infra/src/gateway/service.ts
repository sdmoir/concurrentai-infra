// import * as digitalocean from "@pulumi/digitalocean";
import * as k8s from "@pulumi/kubernetes";

import config from "../config";
import { appLabels, metadata } from "./constants";
import { provider } from "../cluster/provider";

// export const certificate = new digitalocean.Certificate(
//   `certificate-${config.concurrentai.organizationId}`,
//   {
//     type: "lets_encrypt",
//     domains: [
//       `${config.concurrentai.organizationId}.${config.concurrentai.region}.concurrent.ai`,
//     ],
//   }
// );

export const service = new k8s.core.v1.Service(
  "concurrentai-gateway-service",
  {
    metadata: {
      ...metadata,
      // annotations: {
      //   "service.beta.kubernetes.io/do-loadbalancer-protocol": "http",
      //   "service.beta.kubernetes.io/do-loadbalancer-algorithm": "round_robin",
      //   "service.beta.kubernetes.io/do-loadbalancer-tls-ports": "443",
      //   "service.beta.kubernetes.io/do-loadbalancer-certificate-id":
      //     certificate.id,
      //   "service.beta.kubernetes.io/do-loadbalancer-redirect-http-to-https":
      //     "true",
      // },
    },
    spec: {
      type: config.isMinikube ? "ClusterIP" : "LoadBalancer",
      ports: [{ name: "https", port: 443, targetPort: 8080, protocol: "TCP" }],
      selector: appLabels,
    },
  },
  {
    provider,
  }
);

// export const dns = new digitalocean.DnsRecord(
//   `dns-${config.concurrentai.organizationId}`,
//   {
//     domain: "concurrent.ai",
//     type: "A",
//     name: `${config.concurrentai.organizationId}.${config.concurrentai.region}`,
//     value: service.status.loadBalancer.apply(
//       (lb) => lb.ingress[0].ip || lb.ingress[0].hostname
//     ),
//   }
// );
