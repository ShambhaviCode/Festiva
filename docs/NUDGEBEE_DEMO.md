# NudgeBee: the smallest genuine demonstration environment

**Nothing in this document has been executed.** The build environment had no Docker, no Kubernetes and no network access to NudgeBee. These steps follow NudgeBee's own documentation (docs.nudgebee.com, checked 17 November 2026) and need your approval because they create accounts and may cost money.

FESTIVA was not moved to Kubernetes for the sake of the integration. Two options, smallest first.

## Option 1: Event Webhook only (no Kubernetes)

What you get: FESTIVA's real alerts arrive in NudgeBee as events, NudgeBee triages and investigates them, and FESTIVA shows NudgeBee's copy. NudgeBee does not see FESTIVA's infrastructure.

1. Get a NudgeBee workspace (NudgeBee Cloud, or a self-hosted Community install you already run).
2. In NudgeBee: **Admin → Integrations → Webhooks → Event Webhook**, name it `FESTIVA`, choose an account, save, and copy the URL and token.
3. Optional: **avatar → API Tokens → Create Token**, type **Platform**, access limited to Events, 30-day expiry.
4. Set on the FESTIVA server: `NUDGEBEE_EVENT_WEBHOOK_URL`, `NUDGEBEE_EVENT_WEBHOOK_TOKEN`, and optionally `NUDGEBEE_API_URL` and `NUDGEBEE_API_TOKEN`. Restart.
5. `npm run integrations:check`: expect `PASS` for the Event Webhook. In NudgeBee, **Troubleshoot → All Events** shows "FESTIVA: [Controlled test] Integration check".
6. Follow [DEMO.md](DEMO.md) step 7.

## Option 2: FESTIVA on a throwaway KinD cluster watched by the NudgeBee agent

What you get, in addition: NudgeBee's agent sees FESTIVA's pod, its Kubernetes events and its Prometheus metrics, and alerts flow through Alertmanager.

Prerequisites: Docker, kubectl, KinD, Helm, and a NudgeBee Cloud account (the agent connects to it). Per NudgeBee's "Try locally" guide, the eBPF node agent is disabled on KinD, so there are no network metrics or traces; inventory, events, metrics and recommendations still work.

```bash
# 1. Cluster (from NudgeBee's local setup guide)
kind create cluster --name festiva

# 2. NudgeBee agent: Admin → Integrations → Kubernetes Clusters → Add K8s Account
#    (mark it Non-production), copy the agent key, then:
wget https://raw.githubusercontent.com/nudgebee/k8s-agent/main/installation.sh
bash installation.sh -a <agent-key> -d true     # -d true disables the node agent on KinD; installs Prometheus if absent

# 3. FESTIVA image and deployment (files in this repository)
docker build -t festiva:local .
kind load docker-image festiva:local --name festiva
# Edit the Secret in ops/kubernetes/festiva.yaml first (admin and metrics tokens, Sarvam/Flagsmith keys)
kubectl apply -f ops/kubernetes/festiva.yaml

# 4. Alert rules for Prometheus (as a PrometheusRule or in your rules file) and
#    the Alertmanager route to the in-cluster agent:
#    ops/prometheus/festiva-alerts.yml, ops/alertmanager/nudgebee-receiver.yml (receiver A)

# 5. Reach FESTIVA
kubectl -n festiva port-forward svc/festiva 3000:3000
```

Then run the demonstration in [DEMO.md](DEMO.md). Clean up with `kind delete cluster --name festiva`, and delete the cluster account in NudgeBee.

## Approval flow inside NudgeBee (optional)

NudgeBee's Workflow Builder has a **Core → Approval** task and an **integrations.http** task. A workflow triggered by the FESTIVA event can ask an engineer to approve in NudgeBee and then call:

```
POST https://<festiva>/api/ops/runbook-proposals
Authorization: Bearer <FESTIVA_OPS_WEBHOOK_TOKEN>
{"runbook": "pause_voice_capture", "reason": "Approved in NudgeBee", "nudgebee_event_id": "<event id>"}
```

This only creates a proposal. A FESTIVA administrator still approves it in `/admin/operations`; the audit trail records both the NudgeBee reference and the FESTIVA decision.
