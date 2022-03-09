import { SecretValue, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as CodePipelineAction from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';

export class Step01SetupBasicPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    //Creating the artifact to fetch the data from the github and save it in te artifact
    const sourceOutput = new codepipeline.Artifact();

    //creating the pipeline on aws-console
    const pipeline = new codepipeline.Pipeline(this, "CDKPipeline", {
      pipelineName: "First_Code_Pipeline",
      crossAccountKeys: false,         //Pipeline construct creates an AWS Key Management Service (AWS KMS) which cost $1/month. this will save your $1.
      restartExecutionOnUpdate: true   // whenever we make a change the pipeline will be updated 
    });

    //First Stage Source - fetching data from the github 
    pipeline.addStage({
      stageName: "Source",
      actions: [
        new CodePipelineAction.GitHubSourceAction({
          actionName: "Checkout",
          owner: 'github-name',                     //name of profile of github
          repo: 'github-repo-name',              //name of github repo
          oauthToken: SecretValue.secretsManager('Github_token'),                      ///create token on github and save it on aws secret manager
          output: sourceOutput,                                                        //output ko save krrhe hain hm artifact mein jo bnaya hai hmne uper
          branch: "master"                                                             //branch of your repo
        })
      ]
    })



  }
}
