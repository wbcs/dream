# k8s
kubernetes

1. 创建image => push到docker hub
Dockerfile:
```dockerfile
FROM node
ADD app.js /app.js
ENTRYPOINT ["node", "app.js"]
```
```sh
➜ docker build -t image_name:0.0.1 .
➜ docker tag wbcs/image_name:0.0.1 wbcs/hehe
➜ docker push wbcs/hehe
```

2. 创建rc => 创建csv => 集群外访问
first-k8s.yaml:
```yaml
apiVersion: v1
kind: ReplicationController
metadata:
  name: wbcs
spec:
  replicas: 1
  selector:
    app: wbcsselector
  template:
    metadata:
      labels:
        app: wbcsselector
    spec:
      containers:
      - name: wbcs
        image: wbcs/hehe
        ports:
        - containerPort: 8080
```
```sh
➜ kubectl create -f first-k8s.yaml
➜ kubectl get rc
NAME   DESIRED   CURRENT   READY   AGE
wbcs   3         3         3       28m
➜ kubectl expose rc --type=LoadBalancer --name wbcs-http
➜ kubectl get svc
NAME         TYPE           CLUSTER-IP       EXTERNAL-IP   PORT(S)          AGE
kubernetes   ClusterIP      10.96.0.1        <none>        443/TCP          120m
wbcs-http    LoadBalancer   10.111.166.177   <pending>     8080:31191/TCP   27m
# for minikube
➜ minikube service wbcs-http
```

3. 扩充pods
```sh
➜ kubectl scale rc wbcs --replicas=3
➜ curl xxx:xx
```

4. 其他命令：
- `minikube dashboard`
- `kubectl get/delete [pod,svc,rc]`
