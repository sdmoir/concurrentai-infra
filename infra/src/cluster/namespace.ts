import * as k8s from "@pulumi/kubernetes";

import config from "../config";

export const namespace = new k8s.core.v1.Namespace(
  `rendezvous-${config.rendezvous.organizationId}`
);
