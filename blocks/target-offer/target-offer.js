alloy("sendEvent", {
  decisionScopes: ["homepage_hero"]
}).then(function(result) {
  const propositions = result.propositions || [];

  propositions.forEach(function(proposition) {
    proposition.items.forEach(function(item) {
      if (item.data && item.data.content) {
        document.querySelector("#hero-banner").innerHTML = item.data.content;
      }
    });
  });

  const executedPropositions = propositions.map(function(p) {
    return {
      id: p.id,
      scope: p.scope,
      scopeDetails: p.scopeDetails
    };
  });

  if (executedPropositions.length) {
    alloy("sendEvent", {
      xdm: {
        eventType: "decisioning.propositionDisplay",
        _experience: {
          decisioning: {
            propositions: executedPropositions
          }
        }
      }
    });
  }
});