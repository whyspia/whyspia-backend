// This is an auto-generated file, do not edit manually
export const definition = {"models":{"BasicProfile":{"id":"kjzl6hvfrbw6c6x3otbvyr2m8kdgpm0wzce377mfl8ime1n462vjuczpt10to7k","accountRelation":{"type":"single"}},"SymbolDefinition":{"id":"kjzl6hvfrbw6c9e30y0lrguuek3vevn0u2lr1gzxh6a8qdjmrvp6pqtrhkutchi","accountRelation":{"type":"list"}},"Emote":{"id":"kjzl6hvfrbw6c6ea224rua3t1v0yzc06okynnyfrbtg6ccukgkgo9whxfjn6pzn","accountRelation":{"type":"list"}}},"objects":{"BasicProfile":{"bio":{"type":"string","required":false},"username":{"type":"string","required":true},"author":{"type":"view","viewType":"documentAccount"}},"SymbolDefinition":{"edited":{"type":"datetime","required":false,"indexed":true},"symbol":{"type":"string","required":true},"created":{"type":"datetime","required":true,"indexed":true},"authorId":{"type":"string","required":true,"indexed":true},"profileId":{"type":"streamid","required":true},"definition":{"type":"string","required":true},"author":{"type":"view","viewType":"documentAccount"},"profile":{"type":"view","viewType":"relation","relation":{"source":"document","model":"kjzl6hvfrbw6c6x3otbvyr2m8kdgpm0wzce377mfl8ime1n462vjuczpt10to7k","property":"profileId"}}},"Emote":{"edited":{"type":"datetime","required":false,"indexed":true},"symbol":{"type":"string","required":true},"created":{"type":"datetime","required":true,"indexed":true},"authorId":{"type":"string","required":true,"indexed":true},"senderUserId":{"type":"streamid","required":true},"receiverUserId":{"type":"streamid","required":true},"author":{"type":"view","viewType":"documentAccount"},"senderUsername":{"type":"view","viewType":"relation","relation":{"source":"document","model":"kjzl6hvfrbw6c6x3otbvyr2m8kdgpm0wzce377mfl8ime1n462vjuczpt10to7k","property":"senderUserId"}},"receiverUsername":{"type":"view","viewType":"relation","relation":{"source":"document","model":"kjzl6hvfrbw6c6x3otbvyr2m8kdgpm0wzce377mfl8ime1n462vjuczpt10to7k","property":"receiverUserId"}}}},"enums":{},"accountData":{"basicProfile":{"type":"node","name":"BasicProfile"},"symbolDefinitionList":{"type":"connection","name":"SymbolDefinition"},"emoteList":{"type":"connection","name":"Emote"}}}