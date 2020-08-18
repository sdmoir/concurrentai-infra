import config from "../config";
import { createRendezvousService } from "./rendezvous";
import { createModelEnricher } from "./enricher";
import { createModelExecutor } from "./model-executor";

const services = (config.concurrentai.services || []).map((service) => {
  let services = [
    createRendezvousService(service),
    createModelEnricher(service),
  ];

  services.concat(
    service.models.map((model) => {
      return createModelExecutor(service, model);
    })
  );

  return services;
});

export { services };
