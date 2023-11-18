import { readFileSync } from "fs";
import { CeramicClient } from "@ceramicnetwork/http-client";
import {
  createComposite,
  readEncodedComposite,
  writeEncodedComposite,
  writeEncodedCompositeRuntime,
} from "@composedb/devtools-node";
import { Composite } from "@composedb/devtools";
import { DID } from "dids";
import { Ed25519Provider } from "key-did-provider-ed25519";
import { getResolver } from "key-did-resolver";
import { fromString } from "uint8arrays/from-string";

const ceramic = new CeramicClient('http://localhost:7007');

/**
 * @param {Ora} spinner - to provide progress status.
 * @return {Promise<void>} - return void when composite finishes deploying.
 */
export const writeComposite = async (spinner) => {
  await authenticate();
  spinner.info("writing composite to Ceramic");

  const profileComposite = await createComposite(
    ceramic,
    "./composites/00-basicProfile.graphql"
  );



  const symbolDefinitionSchema = readFileSync("./composites/01-symbolDefinition.graphql", {
    encoding: "utf-8",
  }).replace("$PROFILE_ID", profileComposite.modelIDs[0]);

  const symbolDefinitionComposite = await Composite.create({
    ceramic,
    schema: symbolDefinitionSchema,
  });

  const emoteSchema = readFileSync("./composites/02-emote.graphql", {
    encoding: "utf-8",
  }).replace("$PROFILE_ID", profileComposite.modelIDs[0]);

  const emoteComposite = await Composite.create({
    ceramic,
    schema: emoteSchema,
  });


  const composite = Composite.from([
    profileComposite,
    symbolDefinitionComposite,
    emoteComposite,
  ]);

  await writeEncodedComposite(composite, "./src/__generated__/definition.json");
  spinner.info("creating composite for runtime usage");
  await writeEncodedCompositeRuntime(
    ceramic,
    "./src/__generated__/definition.json",
    "./src/__generated__/definition.js"
  );
  spinner.info("deploying composite");
  const deployComposite = await readEncodedComposite(
    ceramic,
    "./src/__generated__/definition.json"
  );

  await deployComposite.startIndexingOn(ceramic);
  spinner.succeed("composite deployed & ready for use");
};

/**
 * Authenticating DID for publishing composite
 * @return {Promise<void>} - return void when DID is authenticated.
 */
const authenticate = async () => {
  const seed = readFileSync("./admin_seed.txt");
  const key = fromString(seed, "base16");
  const did = new DID({
    resolver: getResolver(),
    provider: new Ed25519Provider(key),
  });
  await did.authenticate();
  ceramic.did = did;
};
