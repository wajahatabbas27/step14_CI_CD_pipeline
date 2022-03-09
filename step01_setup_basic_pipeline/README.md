# CI/CD - CONTINOUS INTEGRATION AND CONTINOUS DEPLOYMENT/DELIVERY

In CI/CD pipeline code build - tested and deployed.
When ever we commit our code on the github , It will going to deploy again the code after fetching it is started

## Frontend && Backend Deployment

In backend deployment - what we do is deploy our application and it goes to the cloud formation , while
In Frontend deployment - what we do is deploy our application to the s3 bucket

We are building our pipeline stack now to update our CI/CD to implement the commands

- npm run build
- cdk deploy

# Code Pipeline - Stages in the pipeline

- fetch the code from the github repository
- build the code - npm run build
- deploy the code - cdk deploy

## Github - fetch

all the attributes from where to get the data and all the parameters

## Artifacts

Its just nothing the temporary storage
we are saving the data into artifacts
In the build stage we use the same artifacts as well to bring them what we have saved here when we fetch the data

- we need 2 artifacts

# Conclusion

We create the cdk synth because we want to use this file in the deployment code which we will write in the attribute of templatePath - here we have to give the file of the cloud formation

After running the build command we are saving the files in the artifact as well ,
there are 2 artifacts
1- to fetch data artifact is used
2- after running the build command and cdk synth files are saved in the artifact as well

## Deployment part

Its the stackname which will be deployed , if its not there so it will going to create that particularly , moreover if its overthere so it will be updated , when we deploy our code
