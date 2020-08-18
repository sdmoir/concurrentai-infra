import * as k8s from "@pulumi/kubernetes";

import { namespace } from "./namespace";

export const provider = new k8s.Provider("k8s-provider", {
  namespace: namespace.metadata.name,
});
