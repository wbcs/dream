# 什么是 pod

一组容器的集合，同属一个 `pod` 的容器会被部署到同一个工作结点中。它们共享一些 namespace，例如：network,UTS. 所以在 `pod` 中的容器可以通过访问 ip 来进行通信。

# 为什么要有 pod

首先，因为容器是被设计为运行一个进程的，所以一旦存在某些耦合的进程时，需要共享一些资源。为了既能够保证容器运行单一的进程，又能够共享资源便于管理和调度，于是引入了 `pod` 的概念。

# 什么时候将多个容器组合在一个 pod？

首先，如果没有必要，尽可能的将容器部署在一个单独的 `pod` 中。In other words, Pod should have a single container. 因为同属于一个 `pod` 的容器会被部署到同一个工作结点，这会导致无关联的容器无法利用 k8s 多结点的资源（memory、CPU），降低了基础架构利用率。

其次，`pod` 是扩容无法对单独某一个容器进行扩容，扩容是最小单位是 `pod` 本身，这样如果 `pod` 中的某个容器需要扩容时，其他无需扩容的容器也会被扩容，造成了冗余。

所以，在满足以下所有情况时，才考虑将多个容器组合在一个 `pod` 中：

- 多个容器耦合：其他容器辅助某个主容器协同工作，对外表现为一个整体
- 单个容器无需扩容
- 多个容器必需运行在同一个工作结点

# 访问 pod

除了 `kubectl expose rc/pod pod_name --type=LoadBanlancer --name svc_name` 还有 `kubectl port-forward pod_name 3000:8080`

# 学到的一些命令

```sh
kubectl get po -o yaml
kubectl create -f xxx.yaml
kubectl logs pod_name
kubectl get po --show-labels
kubectl get po -L $label_key
kubectl label po $label_key=$label_value [--overwrite]
```

yaml:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: pod_name
  labels:
    label_key: label_value
spec:
  containers:
    - image: wbcs/hehe
      name: hehe
      ports:
        - containerPort: 8080 # 只读，写了和没写不会影响实际的访问
          protocol: TCP
```
