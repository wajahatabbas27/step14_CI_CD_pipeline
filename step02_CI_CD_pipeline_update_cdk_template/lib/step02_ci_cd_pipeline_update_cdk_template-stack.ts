import { SecretValue, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as codePipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codePipelineAction from 'aws-cdk-lib/aws-codepipeline-actions';
import * as CodeBuild from 'aws-cdk-lib/aws-codebuild';



export class Step02CiCdPipelineUpdateCdkTemplateStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    //artifacts 

    //artifact for the source code 
    const sourceOutput = new codePipeline.Artifact();

    //artifact for the build stage 
    const CDKoutput = new codePipeline.Artifact();

    //Code build action, Here you will define a complete build which will be executed
    const cdkBuild = new CodeBuild.PipelineProject(this, 'CDKBuild', {
      projectName: "FirstCdkBuild",
      buildSpec: CodeBuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            "runtime-versions": {
              "nodejs": 12
            },
            commands: [
              'cd step14_CI_CD_pipeline',
              'cd step02_CI_CD_pipeline_update_cdk_template',
              'npm install'
            ],
          },
          build: {
            commands: [
              'npm run build',
              'npm run cdk synth -- -o dist'
            ],
          },
        },
        artifacts: {
          'base-directory': './step02_CI_CD_pipeline_update_cdk_template/dist',        ///outputting our generated JSON CloudFormation files to the dist directory
          files: [
            `${this.stackName}.template.json`,
          ],
        },
      }),
      environment: {
        buildImage: CodeBuild.LinuxBuildImage.STANDARD_3_0,                            ///BuildImage version 3 because we are using nodejs environment 12
      }
    });

    //Define the pipeline
    const pipeline = new codePipeline.Pipeline(this, 'CDK_Pipeline', {
      crossAccountKeys: false,                      //Pipeline construct creates an AWS Key Management Service (AWS KMS) which cost $1/month. this will save your $1.
      restartExecutionOnUpdate: true,               //Indicates whether to rerun the AWS CodePipeline pipeline after you update it.
    });

    //Adding stages to pipeline

    //First Stage Source  - artifacts add krrhe hain source ke liye ke code fetch krke yhn pe leke ao
    pipeline.addStage({
      stageName: 'SourceFetching',
      actions: [
        new codePipelineAction.GitHubSourceAction({
          actionName: 'Checkout',
          owner: 'wajahatabbas27',
          repo: 'step-04-Appsync-DynamoDB-Lambda',
          //oauthToken:SecretValue.secretsManager('GITHUB_TOKEN_AWS_SOURCE') -- its getting the token from the secretsmanager ///create token on github and save it on aws secret manager
          oauthToken: SecretValue.plainText("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"),  ///create token on github and use it directly
          output: sourceOutput,
          branch: 'master',
        }),
      ],
    });

    //second stage source - artifacts add krrhe hain take save ho code build process ke bd
    pipeline.addStage({
      stageName: "Build",
      actions: [
        new codePipelineAction.CodeBuildAction({
          actionName: 'cdkBuild',
          project: cdkBuild,                                               // yh process hai uper build ka jo likha hai hmne yh chalao yh chalao sb commands wagera
          input: sourceOutput,                                             // code input phle artifact se kra hai 
          outputs: [CDKoutput]                                             // commands run krke code ko output mein is artifact mein save kro 
        }),
      ],
    });

    //deploy process hai , phle source - phir build - phir deploy
    pipeline.addStage({
      stageName: 'DeployCDK',
      actions: [
        new codePipelineAction.CloudFormationCreateUpdateStackAction({
          actionName: "AdministerPipeline",
          templatePath: CDKoutput.atPath(`${this.stackName}.template.json`),           ///Input artifact with the CloudFormation template to deploy
          stackName: this.stackName,                                                   ///Name of stack
          adminPermissions: true
        })
      ]
    })



  }
}
