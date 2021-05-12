import * as cdk from '@aws-cdk/core';
import {
  Vpc,
  Subnet,
  CfnInternetGateway,
  CfnVPCGatewayAttachment,
  CfnEIP,
  CfnNatGateway,
  RouterType,

} from '@aws-cdk/aws-ec2';

export class VpcStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const env: string = this.node.tryGetContext("env")
    const context = this.node.tryGetContext(env)

    // CompanyIPlist from context
    let companyIpList: Array<string> = []

    context["company_private"].forEach((element: string) => {
      companyIpList.push(element)
    });

    // Public Subnet from context
    const publicCidr: Array<string> = [
      context["public_1a_cidr"],
      context["public_1c_cidr"]
    ]
    // Private Subnet from context
    const privateCidr: Array<string> = [
      context["private_1a_cidr"],
      context["private_1c_cidr"]
    ]

    const nonVpc = Vpc.fromLookup(this, "VPC", {
      isDefault: false
    }
    )
    const nonVpcId = nonVpc.vpcId
    const vgwId = nonVpc.vpnGatewayId

    // Create InternetGateWay
    const igw = new CfnInternetGateway(this, "InternetGateway")
    new CfnVPCGatewayAttachment(this, "igw_attachment", {
      vpcId: nonVpcId, internetGatewayId: igw.ref
    })

    // Create PublicSubnet
    const pulicSubnetA = new Subnet(this, "public-a", {
      availabilityZone: "ap-northeast-1a",
      vpcId: nonVpcId,
      cidrBlock: publicCidr[0],
      mapPublicIpOnLaunch: true
    })
    const pulicSubnetC = new Subnet(this, "public-a", {
      availabilityZone: "ap-northeast-1c",
      vpcId: nonVpcId,
      cidrBlock: publicCidr[1],
      mapPublicIpOnLaunch: true
    })

    // Create PrivateSubnet
    const privateSubnetA = new Subnet(this, "private-a", {
      availabilityZone: "ap-northeast-1a",
      vpcId: nonVpcId,
      cidrBlock: privateCidr[0],
      mapPublicIpOnLaunch: false,
    })
    const privateSubnetC = new Subnet(this, "private-c", {
      availabilityZone: "ap-northeast-1c",
      vpcId: nonVpcId,
      cidrBlock: privateCidr[1],
      mapPublicIpOnLaunch: false
    })

    // Create EIP and NAT
    const elasitcIp = new CfnEIP(this, "eip")
    const natgw = new CfnNatGateway(this, "nat-gateway", {
      allocationId: elasitcIp.getAtt("AllocationId").toString(),
      subnetId: pulicSubnetA.subnetId
    })

    // Add igw in PublicRoute
    pulicSubnetA.addRoute("publicSubnetARoute", {
      routerType: RouterType.GATEWAY,
      routerId: igw.ref
    })
    pulicSubnetC.addRoute("publicSubnetCRoute", {
      routerType: RouterType.GATEWAY,
      routerId: igw.ref
    })

    // Add nat in PrivateRoute
    privateSubnetA.addRoute("privateSubnetARoute", {
      routerType: RouterType.GATEWAY,
      routerId: natgw.ref
    })
    privateSubnetC.addRoute("privateSubnetCRoute", {
      routerType: RouterType.GATEWAY,
      routerId: natgw.ref
    })

    // Add Company IP in Routes
    companyIpList.forEach((element, index) =>
      pulicSubnetA.addRoute(`publicSubnetARouteCompany-${index}`, {
        destinationCidrBlock: element,
        routerId: vgwId!,
        routerType: RouterType.GATEWAY
      })
    )
    companyIpList.forEach((element, index) =>
      pulicSubnetC.addRoute(`publicSubnetCRouteCompany-${index}`, {
        destinationCidrBlock: element,
        routerId: vgwId!,
        routerType: RouterType.GATEWAY
      })
    )
    companyIpList.forEach((element, index) =>
      privateSubnetA.addRoute(`privateSubnetARouteCompany-${index}`, {
        destinationCidrBlock: element,
        routerId: vgwId!,
        routerType: RouterType.GATEWAY
      })
    )
    companyIpList.forEach((element, index) =>
      pulicSubnetC.addRoute(`privateSubnetCRouteCompany-${index}`, {
        destinationCidrBlock: element,
        routerId: vgwId!,
        routerType: RouterType.GATEWAY
      })
    )
  }
}
