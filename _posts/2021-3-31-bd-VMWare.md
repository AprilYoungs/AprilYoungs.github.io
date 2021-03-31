---
layout: post
title:  "Mac版VMWare网络相关"
date:   2021-3-31
categories: big data
---
### 恢复网络默认设置

```shell
#!/bin/bash
# Reset VMware Fusion Networking
 
# Clear out the Configuration
sudo rm -f /Library/Preferences/VMware\ Fusion/networking*
sudo rm -f /Library/Preferences/VMware\ Fusion/*location*
sudo rm -rf /Library/Preferences/VMware\ Fusion/vmnet*
sudo rm -rf /var/db/vmware/vmnet-dhcpd-vmnet*
 
# Reconfigure Networking
sudo /Applications/VMware\ Fusion.app/Contents/Library/vmnet-cli -c
sudo /Applications/VMware\ Fusion.app/Contents/Library/vmnet-cli --stop
sudo /Applications/VMware\ Fusion.app/Contents/Library/vmnet-cli --start
sudo /Applications/VMware\ Fusion.app/Contents/Library/vmnet-cli --status
```

### 修改虚拟机ip

仅主机型网络 – vmnet1

网络地址转换 (NAT) 网络 – vmnet8

VMware Fusion 有三个网络配置文件：networking、dhcpd.conf 和 nat.conf。

全局

```shell
/Library/Preferences/VMware\ Fusion/networking
```

vmnet1：

```shell
/Library/Preferences/VMware\ Fusion/vmnet1/dhcpd.conf
/Library/Preferences/VMware\ Fusion/vmnet1/nat.conf
```

vmnet8：

```shell
/Library/Preferences/VMware\ Fusion/vmnet8/dhcpd.conf
/Library/Preferences/VMware\ Fusion/vmnet8/nat.conf
```

#### 停止 vmnet 网络服务

```shell
sudo /Applications/VMware\ Fusion.app/Contents/Library/vmnet-cli --stop
```

#### 只需要修改 networking 配置文件

```shell
sudo vi /Library/Preferences/VMware\ Fusion/networking
```

```shell
VERSION=1,0
answer VNET_1_DHCP yes
answer VNET_1_DHCP_CFG_HASH 4FC9F5B3EDDD197AA38CF256BEED6F2E15C62028
answer VNET_1_HOSTONLY_NETMASK 255.255.255.0
answer VNET_1_HOSTONLY_SUBNET 192.168.1.0    # private 修改成自己需要的网段
answer VNET_1_VIRTUAL_ADAPTER yes
answer VNET_8_DHCP yes
answer VNET_8_DHCP_CFG_HASH 05AE2DE46D0BD3F82E79CC8E0DC3F2E891397E11
answer VNET_8_HOSTONLY_NETMASK 255.255.255.0
answer VNET_8_HOSTONLY_SUBNET 172.16.134.0   # nat 修改成自己需要的网段
answer VNET_8_NAT yes
answer VNET_8_VIRTUAL_ADAPTER yes
```

#### 配置网络

```shell
sudo /Applications/VMware\ Fusion.app/Contents/Library/vmnet-cli --configure
```

vmnet-cli 将根据上述修改的地址段自动修改 dhcpd.conf 和 nat.conf 中的 IP 地址。

查看 dhcpd.conf 和 nat.conf 配置文件：

```shell
cat /Library/Preferences/VMware\ Fusion/vmnet1/dhcpd.conf
cat /Library/Preferences/VMware\ Fusion/vmnet1/nat.conf
 
cat /Library/Preferences/VMware\ Fusion/vmnet8/dhcpd.conf
cat /Library/Preferences/VMware\ Fusion/vmnet8/nat.conf
```

#### 启动网络服务

```shell
sudo /Applications/VMware\ Fusion.app/Contents/Library/vmnet-cli --start
```

#### 虚拟机重新获取配置

```shell
# ens33 为对应网卡
sudo dhclient -v -r ens33
```

#### 虚拟机设置静态ip

```shell
sudo vi /etc/sysconfig/network-scripts/ifcfg-ens33

# 修改如下内容

TYPE="Ethernet"
PROXY_METHOD="none"
BROWSER_ONLY="no"
# 设置为静态获取ip
BOOTPROTO="static"
DEFROUTE="yes"
IPV4_FAILURE_FATAL="no"
IPV6INIT="yes"
IPV6_AUTOCONF="yes"
IPV6_DEFROUTE="yes"
IPV6_FAILURE_FATAL="no"
IPV6_ADDR_GEN_MODE="stable-privacy"
NAME="ens33"
UUID="96ab3acb-8cf7-4650-9e37-855124c30666"
DEVICE="ens33"
# 更具实际情况设置下面字段
ONBOOT="yes"
IPADDR=172.16.134.4   # 本机ip
NETMASK=255.255.255.0  # 子网掩码
GATEWAY=172.16.134.1   # router的ip
DNS1=8.8.8.8					 # DNS 可选
```

重启网卡服务

```shell
systemctl restart network

# 查看设置的ip是否生效
ip addr 
# 测试一下网络
ping www.baidu.com
```