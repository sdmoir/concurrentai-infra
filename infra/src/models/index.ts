import { createModelService } from "./model";

import config, { ServiceConfig } from "../config";

const models = config.rendezvous.services.reduce(
  (models: Record<string, any>, service: ServiceConfig) => {
    models[service.id] = service.models.map((model) =>
      createModelService(service, model)
    );
    return models;
  },
  {}
);

export { models };
