# Astra Message Board demo app

Demo using Waline comment system to quickly create content and then backup/restore.

> This is for demo purposes only! Passwords are not properly stored and it is not optimized for security!

Simply deploy the yaml files on K8s. All container images are pulled from quay.io to avoid any issues with Docker Hub pull rate limits in lab environments. 
Get the loadbalancer IP and access the demo app via http://<IP>. Create some content, perform a backup. Then simulate a ransomware attack 
by going to http://<IP>/attack There is a login just to prevent accidential/premature attacks. Login with user _hack_ and password _astra123_. This will encrypt/scramble all comments. Refresh the demo app to see the result. Then restore.

## Components

* **nginx** - Reverse Proxy. Includes a Service that requests a loadbalancer. Frontend UI as well as the waline system will be available from this. Can be replaced with Ingress or similar but this should universally work. NGINX config is provided via ConfigMap, as is the htpasswd for authentication of the simulated ransomware attack. 
* **waline-frontend** Node.js + Epress. Hosts the static webpage (based on https://html5up.net/directive) and the simulated ransomware attack code
* **waline** The actual comment system (https://waline.js.org/). Uses a Postgres database to persist the comments
* **postgres** Simple Postgres database. SQL Code for initial database layout is provided via a Configmap. KISS principle for demo purposes, e.g. no Operator/HA,...

## Customization

Waline server can be configured via ENV variables, see docs at https://waline.js.org/en/reference/server/env.html

Waline layout can be modified via CSS, see docs at https://waline.js.org/en/reference/client/style.html

Avatar images are generated based on a hash of the nickname, using https://seccdn.libravatar.org/. Different styles can be used, try them at https://seccdn.libravatar.org/tools/check/ and also see docs at https://de.gravatar.com/site/implement/images/

Emojis are included from external source, can be changed in client config (index.js - Requires container rebuild). See https://www.jsdelivr.com/package/npm/@waline/emojis for options.

For Postgres configuration see https://hub.docker.com/_/postgres

## Helpers
### local kubectl usage
````
export KUBECONFIG=~/.kube/gke-astra-demo-cluster1-230328
gcloud auth login
GCLOUD_PROJECTID=rt1958073
GCLOUD_CLUSTER=cluster1
GCLOUD_ZONE=us-east1-b
gcloud config set project $GCLOUD_PROJECTID
gcloud container clusters get-credentials $GCLOUD_CLUSTER --zone $GCLOUD_ZONE
k get nodes
````
### TLS prep (create self signed certificate)
````
HOST_SELFSIGNED=selfsigned-waline.burkl.com
openssl genrsa -out selfsigned.key 2048
openssl req -x509 \\n  -new -nodes  \\n  -days 10 \\n  -key selfsigned.key \\n  -out selfsigned.crt \\n  -subj "/CN=$HOST_SELFSIGNED"
# Add output to selfsigned.yaml, Secret data
cat selfsigned.crt | base64
# Add output to selfsigned.yaml, Secret data
cat selfsigned.key | base64
````

### Build new Web App 
````
# Build new App version, change also in messageboard.yml
APP_VERSION=0.1.1
IMAGE_NAMESPACE=ntapfvsqr
IMAGE_NAME=astra-demo-waline-frontend
nerdctl build -t $IMAGE_NAMESPACE/$IMAGE_NAME:$APP_VERSION .
nerdctl push $IMAGE_NAMESPACE/$IMAGE_NAME:$APP_VERSION
````

### Deploy
````
NAMESPACE=astra-demo-waline
k create ns $NAMESPACE
k apply -f deploy -n $NAMESPACE
````

### Cloudflare
Get public IP from Ingress:
````
k get ingress -n $NAMESPACE
````
Create/change DNS settings: A record for `selfsigned-waline` with public ingress IP. `selfsigned-waline.burkl.com` is handled by Workers. Custom Domain has been set to `techtag.burkl.com`



