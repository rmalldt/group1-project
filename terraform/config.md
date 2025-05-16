region - eu-west-2
ami - ami-0fc32db49bc3bfbb1
instance type - t2.micro
vpc - vpc-0d1af9f9638ef5102
subnet - subnet-069ee0c76b04de281

- Run `scp -i ~/aws/aws_keys/default-ec2.pem docker-compose.yml ec2-user@ec2-18-133-117-194.eu-west-2.compute.amazonaws.com:/home/ec2-user/rangeiq`.
- Run `ansible-playbook playbooks/docker-install.yml`.
- Run `ansible-playbook playbooks/docker-run.yml`.
