"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Step02CiCdPipelineUpdateCdkTemplateStack = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib");
const codePipeline = require("aws-cdk-lib/aws-codepipeline");
const codePipelineAction = require("aws-cdk-lib/aws-codepipeline-actions");
const CodeBuild = require("aws-cdk-lib/aws-codebuild");
class Step02CiCdPipelineUpdateCdkTemplateStack extends aws_cdk_lib_1.Stack {
    constructor(scope, id, props) {
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
                    'base-directory': './step02_CI_CD_pipeline_update_cdk_template/dist',
                    files: [
                        `${this.stackName}.template.json`,
                    ],
                },
            }),
            environment: {
                buildImage: CodeBuild.LinuxBuildImage.STANDARD_3_0,
            }
        });
        //Define the pipeline
        const pipeline = new codePipeline.Pipeline(this, 'CDK_Pipeline', {
            crossAccountKeys: false,
            restartExecutionOnUpdate: true,
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
                    oauthToken: aws_cdk_lib_1.SecretValue.plainText("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"),
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
                    project: cdkBuild,
                    input: sourceOutput,
                    outputs: [CDKoutput] // commands run krke code ko output mein is artifact mein save kro 
                }),
            ],
        });
        //deploy process hai , phle source - phir build - phir deploy
        pipeline.addStage({
            stageName: 'DeployCDK',
            actions: [
                new codePipelineAction.CloudFormationCreateUpdateStackAction({
                    actionName: "AdministerPipeline",
                    templatePath: CDKoutput.atPath(`${this.stackName}.template.json`),
                    stackName: this.stackName,
                    adminPermissions: true
                })
            ]
        });
    }
}
exports.Step02CiCdPipelineUpdateCdkTemplateStack = Step02CiCdPipelineUpdateCdkTemplateStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RlcDAyX2NpX2NkX3BpcGVsaW5lX3VwZGF0ZV9jZGtfdGVtcGxhdGUtc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzdGVwMDJfY2lfY2RfcGlwZWxpbmVfdXBkYXRlX2Nka190ZW1wbGF0ZS1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw2Q0FBNkQ7QUFFN0QsNkRBQTZEO0FBQzdELDJFQUEyRTtBQUMzRSx1REFBdUQ7QUFJdkQsTUFBYSx3Q0FBeUMsU0FBUSxtQkFBSztJQUNqRSxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQWtCO1FBQzFELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLFlBQVk7UUFFWiwrQkFBK0I7UUFDL0IsTUFBTSxZQUFZLEdBQUcsSUFBSSxZQUFZLENBQUMsUUFBUSxFQUFFLENBQUM7UUFFakQsK0JBQStCO1FBQy9CLE1BQU0sU0FBUyxHQUFHLElBQUksWUFBWSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBRTlDLGlGQUFpRjtRQUNqRixNQUFNLFFBQVEsR0FBRyxJQUFJLFNBQVMsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRTtZQUMvRCxXQUFXLEVBQUUsZUFBZTtZQUM1QixTQUFTLEVBQUUsU0FBUyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUM7Z0JBQ3hDLE9BQU8sRUFBRSxLQUFLO2dCQUNkLE1BQU0sRUFBRTtvQkFDTixPQUFPLEVBQUU7d0JBQ1Asa0JBQWtCLEVBQUU7NEJBQ2xCLFFBQVEsRUFBRSxFQUFFO3lCQUNiO3dCQUNELFFBQVEsRUFBRTs0QkFDUiwwQkFBMEI7NEJBQzFCLDhDQUE4Qzs0QkFDOUMsYUFBYTt5QkFDZDtxQkFDRjtvQkFDRCxLQUFLLEVBQUU7d0JBQ0wsUUFBUSxFQUFFOzRCQUNSLGVBQWU7NEJBQ2YsOEJBQThCO3lCQUMvQjtxQkFDRjtpQkFDRjtnQkFDRCxTQUFTLEVBQUU7b0JBQ1QsZ0JBQWdCLEVBQUUsa0RBQWtEO29CQUNwRSxLQUFLLEVBQUU7d0JBQ0wsR0FBRyxJQUFJLENBQUMsU0FBUyxnQkFBZ0I7cUJBQ2xDO2lCQUNGO2FBQ0YsQ0FBQztZQUNGLFdBQVcsRUFBRTtnQkFDWCxVQUFVLEVBQUUsU0FBUyxDQUFDLGVBQWUsQ0FBQyxZQUFZO2FBQ25EO1NBQ0YsQ0FBQyxDQUFDO1FBRUgscUJBQXFCO1FBQ3JCLE1BQU0sUUFBUSxHQUFHLElBQUksWUFBWSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsY0FBYyxFQUFFO1lBQy9ELGdCQUFnQixFQUFFLEtBQUs7WUFDdkIsd0JBQXdCLEVBQUUsSUFBSTtTQUMvQixDQUFDLENBQUM7UUFFSCwyQkFBMkI7UUFFM0IsaUdBQWlHO1FBQ2pHLFFBQVEsQ0FBQyxRQUFRLENBQUM7WUFDaEIsU0FBUyxFQUFFLGdCQUFnQjtZQUMzQixPQUFPLEVBQUU7Z0JBQ1AsSUFBSSxrQkFBa0IsQ0FBQyxrQkFBa0IsQ0FBQztvQkFDeEMsVUFBVSxFQUFFLFVBQVU7b0JBQ3RCLEtBQUssRUFBRSxnQkFBZ0I7b0JBQ3ZCLElBQUksRUFBRSxpQ0FBaUM7b0JBQ3ZDLCtLQUErSztvQkFDL0ssVUFBVSxFQUFFLHlCQUFXLENBQUMsU0FBUyxDQUFDLDBDQUEwQyxDQUFDO29CQUM3RSxNQUFNLEVBQUUsWUFBWTtvQkFDcEIsTUFBTSxFQUFFLFFBQVE7aUJBQ2pCLENBQUM7YUFDSDtTQUNGLENBQUMsQ0FBQztRQUVILHNGQUFzRjtRQUN0RixRQUFRLENBQUMsUUFBUSxDQUFDO1lBQ2hCLFNBQVMsRUFBRSxPQUFPO1lBQ2xCLE9BQU8sRUFBRTtnQkFDUCxJQUFJLGtCQUFrQixDQUFDLGVBQWUsQ0FBQztvQkFDckMsVUFBVSxFQUFFLFVBQVU7b0JBQ3RCLE9BQU8sRUFBRSxRQUFRO29CQUNqQixLQUFLLEVBQUUsWUFBWTtvQkFDbkIsT0FBTyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQTZDLG1FQUFtRTtpQkFDckksQ0FBQzthQUNIO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsNkRBQTZEO1FBQzdELFFBQVEsQ0FBQyxRQUFRLENBQUM7WUFDaEIsU0FBUyxFQUFFLFdBQVc7WUFDdEIsT0FBTyxFQUFFO2dCQUNQLElBQUksa0JBQWtCLENBQUMscUNBQXFDLENBQUM7b0JBQzNELFVBQVUsRUFBRSxvQkFBb0I7b0JBQ2hDLFlBQVksRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsZ0JBQWdCLENBQUM7b0JBQ2pFLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUztvQkFDekIsZ0JBQWdCLEVBQUUsSUFBSTtpQkFDdkIsQ0FBQzthQUNIO1NBQ0YsQ0FBQyxDQUFBO0lBSUosQ0FBQztDQUNGO0FBcEdELDRGQW9HQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFNlY3JldFZhbHVlLCBTdGFjaywgU3RhY2tQcm9wcyB9IGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0ICogYXMgY29kZVBpcGVsaW5lIGZyb20gJ2F3cy1jZGstbGliL2F3cy1jb2RlcGlwZWxpbmUnO1xuaW1wb3J0ICogYXMgY29kZVBpcGVsaW5lQWN0aW9uIGZyb20gJ2F3cy1jZGstbGliL2F3cy1jb2RlcGlwZWxpbmUtYWN0aW9ucyc7XG5pbXBvcnQgKiBhcyBDb2RlQnVpbGQgZnJvbSAnYXdzLWNkay1saWIvYXdzLWNvZGVidWlsZCc7XG5cblxuXG5leHBvcnQgY2xhc3MgU3RlcDAyQ2lDZFBpcGVsaW5lVXBkYXRlQ2RrVGVtcGxhdGVTdGFjayBleHRlbmRzIFN0YWNrIHtcbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBTdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICAvL2FydGlmYWN0cyBcblxuICAgIC8vYXJ0aWZhY3QgZm9yIHRoZSBzb3VyY2UgY29kZSBcbiAgICBjb25zdCBzb3VyY2VPdXRwdXQgPSBuZXcgY29kZVBpcGVsaW5lLkFydGlmYWN0KCk7XG5cbiAgICAvL2FydGlmYWN0IGZvciB0aGUgYnVpbGQgc3RhZ2UgXG4gICAgY29uc3QgQ0RLb3V0cHV0ID0gbmV3IGNvZGVQaXBlbGluZS5BcnRpZmFjdCgpO1xuXG4gICAgLy9Db2RlIGJ1aWxkIGFjdGlvbiwgSGVyZSB5b3Ugd2lsbCBkZWZpbmUgYSBjb21wbGV0ZSBidWlsZCB3aGljaCB3aWxsIGJlIGV4ZWN1dGVkXG4gICAgY29uc3QgY2RrQnVpbGQgPSBuZXcgQ29kZUJ1aWxkLlBpcGVsaW5lUHJvamVjdCh0aGlzLCAnQ0RLQnVpbGQnLCB7XG4gICAgICBwcm9qZWN0TmFtZTogXCJGaXJzdENka0J1aWxkXCIsXG4gICAgICBidWlsZFNwZWM6IENvZGVCdWlsZC5CdWlsZFNwZWMuZnJvbU9iamVjdCh7XG4gICAgICAgIHZlcnNpb246ICcwLjInLFxuICAgICAgICBwaGFzZXM6IHtcbiAgICAgICAgICBpbnN0YWxsOiB7XG4gICAgICAgICAgICBcInJ1bnRpbWUtdmVyc2lvbnNcIjoge1xuICAgICAgICAgICAgICBcIm5vZGVqc1wiOiAxMlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbW1hbmRzOiBbXG4gICAgICAgICAgICAgICdjZCBzdGVwMTRfQ0lfQ0RfcGlwZWxpbmUnLFxuICAgICAgICAgICAgICAnY2Qgc3RlcDAyX0NJX0NEX3BpcGVsaW5lX3VwZGF0ZV9jZGtfdGVtcGxhdGUnLFxuICAgICAgICAgICAgICAnbnBtIGluc3RhbGwnXG4gICAgICAgICAgICBdLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgYnVpbGQ6IHtcbiAgICAgICAgICAgIGNvbW1hbmRzOiBbXG4gICAgICAgICAgICAgICducG0gcnVuIGJ1aWxkJyxcbiAgICAgICAgICAgICAgJ25wbSBydW4gY2RrIHN5bnRoIC0tIC1vIGRpc3QnXG4gICAgICAgICAgICBdLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIGFydGlmYWN0czoge1xuICAgICAgICAgICdiYXNlLWRpcmVjdG9yeSc6ICcuL3N0ZXAwMl9DSV9DRF9waXBlbGluZV91cGRhdGVfY2RrX3RlbXBsYXRlL2Rpc3QnLCAgICAgICAgLy8vb3V0cHV0dGluZyBvdXIgZ2VuZXJhdGVkIEpTT04gQ2xvdWRGb3JtYXRpb24gZmlsZXMgdG8gdGhlIGRpc3QgZGlyZWN0b3J5XG4gICAgICAgICAgZmlsZXM6IFtcbiAgICAgICAgICAgIGAke3RoaXMuc3RhY2tOYW1lfS50ZW1wbGF0ZS5qc29uYCxcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgfSksXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBidWlsZEltYWdlOiBDb2RlQnVpbGQuTGludXhCdWlsZEltYWdlLlNUQU5EQVJEXzNfMCwgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8vQnVpbGRJbWFnZSB2ZXJzaW9uIDMgYmVjYXVzZSB3ZSBhcmUgdXNpbmcgbm9kZWpzIGVudmlyb25tZW50IDEyXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvL0RlZmluZSB0aGUgcGlwZWxpbmVcbiAgICBjb25zdCBwaXBlbGluZSA9IG5ldyBjb2RlUGlwZWxpbmUuUGlwZWxpbmUodGhpcywgJ0NES19QaXBlbGluZScsIHtcbiAgICAgIGNyb3NzQWNjb3VudEtleXM6IGZhbHNlLCAgICAgICAgICAgICAgICAgICAgICAvL1BpcGVsaW5lIGNvbnN0cnVjdCBjcmVhdGVzIGFuIEFXUyBLZXkgTWFuYWdlbWVudCBTZXJ2aWNlIChBV1MgS01TKSB3aGljaCBjb3N0ICQxL21vbnRoLiB0aGlzIHdpbGwgc2F2ZSB5b3VyICQxLlxuICAgICAgcmVzdGFydEV4ZWN1dGlvbk9uVXBkYXRlOiB0cnVlLCAgICAgICAgICAgICAgIC8vSW5kaWNhdGVzIHdoZXRoZXIgdG8gcmVydW4gdGhlIEFXUyBDb2RlUGlwZWxpbmUgcGlwZWxpbmUgYWZ0ZXIgeW91IHVwZGF0ZSBpdC5cbiAgICB9KTtcblxuICAgIC8vQWRkaW5nIHN0YWdlcyB0byBwaXBlbGluZVxuXG4gICAgLy9GaXJzdCBTdGFnZSBTb3VyY2UgIC0gYXJ0aWZhY3RzIGFkZCBrcnJoZSBoYWluIHNvdXJjZSBrZSBsaXllIGtlIGNvZGUgZmV0Y2gga3JrZSB5aG4gcGUgbGVrZSBhb1xuICAgIHBpcGVsaW5lLmFkZFN0YWdlKHtcbiAgICAgIHN0YWdlTmFtZTogJ1NvdXJjZUZldGNoaW5nJyxcbiAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgbmV3IGNvZGVQaXBlbGluZUFjdGlvbi5HaXRIdWJTb3VyY2VBY3Rpb24oe1xuICAgICAgICAgIGFjdGlvbk5hbWU6ICdDaGVja291dCcsXG4gICAgICAgICAgb3duZXI6ICd3YWphaGF0YWJiYXMyNycsXG4gICAgICAgICAgcmVwbzogJ3N0ZXAtMDQtQXBwc3luYy1EeW5hbW9EQi1MYW1iZGEnLFxuICAgICAgICAgIC8vb2F1dGhUb2tlbjpTZWNyZXRWYWx1ZS5zZWNyZXRzTWFuYWdlcignR0lUSFVCX1RPS0VOX0FXU19TT1VSQ0UnKSAtLSBpdHMgZ2V0dGluZyB0aGUgdG9rZW4gZnJvbSB0aGUgc2VjcmV0c21hbmFnZXIgLy8vY3JlYXRlIHRva2VuIG9uIGdpdGh1YiBhbmQgc2F2ZSBpdCBvbiBhd3Mgc2VjcmV0IG1hbmFnZXJcbiAgICAgICAgICBvYXV0aFRva2VuOiBTZWNyZXRWYWx1ZS5wbGFpblRleHQoXCJnaHBfRHRuVmZOZkpzRjZBWmgxeHRYNkpUUVlxUVpkSmt6M1loQ0R0XCIpLCAgLy8vY3JlYXRlIHRva2VuIG9uIGdpdGh1YiBhbmQgdXNlIGl0IGRpcmVjdGx5XG4gICAgICAgICAgb3V0cHV0OiBzb3VyY2VPdXRwdXQsXG4gICAgICAgICAgYnJhbmNoOiAnbWFzdGVyJyxcbiAgICAgICAgfSksXG4gICAgICBdLFxuICAgIH0pO1xuXG4gICAgLy9zZWNvbmQgc3RhZ2Ugc291cmNlIC0gYXJ0aWZhY3RzIGFkZCBrcnJoZSBoYWluIHRha2Ugc2F2ZSBobyBjb2RlIGJ1aWxkIHByb2Nlc3Mga2UgYmRcbiAgICBwaXBlbGluZS5hZGRTdGFnZSh7XG4gICAgICBzdGFnZU5hbWU6IFwiQnVpbGRcIixcbiAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgbmV3IGNvZGVQaXBlbGluZUFjdGlvbi5Db2RlQnVpbGRBY3Rpb24oe1xuICAgICAgICAgIGFjdGlvbk5hbWU6ICdjZGtCdWlsZCcsXG4gICAgICAgICAgcHJvamVjdDogY2RrQnVpbGQsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB5aCBwcm9jZXNzIGhhaSB1cGVyIGJ1aWxkIGthIGpvIGxpa2hhIGhhaSBobW5lIHloIGNoYWxhbyB5aCBjaGFsYW8gc2IgY29tbWFuZHMgd2FnZXJhXG4gICAgICAgICAgaW5wdXQ6IHNvdXJjZU91dHB1dCwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjb2RlIGlucHV0IHBobGUgYXJ0aWZhY3Qgc2Uga3JhIGhhaSBcbiAgICAgICAgICBvdXRwdXRzOiBbQ0RLb3V0cHV0XSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbW1hbmRzIHJ1biBrcmtlIGNvZGUga28gb3V0cHV0IG1laW4gaXMgYXJ0aWZhY3QgbWVpbiBzYXZlIGtybyBcbiAgICAgICAgfSksXG4gICAgICBdLFxuICAgIH0pO1xuXG4gICAgLy9kZXBsb3kgcHJvY2VzcyBoYWkgLCBwaGxlIHNvdXJjZSAtIHBoaXIgYnVpbGQgLSBwaGlyIGRlcGxveVxuICAgIHBpcGVsaW5lLmFkZFN0YWdlKHtcbiAgICAgIHN0YWdlTmFtZTogJ0RlcGxveUNESycsXG4gICAgICBhY3Rpb25zOiBbXG4gICAgICAgIG5ldyBjb2RlUGlwZWxpbmVBY3Rpb24uQ2xvdWRGb3JtYXRpb25DcmVhdGVVcGRhdGVTdGFja0FjdGlvbih7XG4gICAgICAgICAgYWN0aW9uTmFtZTogXCJBZG1pbmlzdGVyUGlwZWxpbmVcIixcbiAgICAgICAgICB0ZW1wbGF0ZVBhdGg6IENES291dHB1dC5hdFBhdGgoYCR7dGhpcy5zdGFja05hbWV9LnRlbXBsYXRlLmpzb25gKSwgICAgICAgICAgIC8vL0lucHV0IGFydGlmYWN0IHdpdGggdGhlIENsb3VkRm9ybWF0aW9uIHRlbXBsYXRlIHRvIGRlcGxveVxuICAgICAgICAgIHN0YWNrTmFtZTogdGhpcy5zdGFja05hbWUsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8vTmFtZSBvZiBzdGFja1xuICAgICAgICAgIGFkbWluUGVybWlzc2lvbnM6IHRydWVcbiAgICAgICAgfSlcbiAgICAgIF1cbiAgICB9KVxuXG5cblxuICB9XG59XG4iXX0=