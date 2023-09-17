# HugeNx

✨This repository is an implementation of a [custom Nx preset](https://nx.dev/extending-nx/recipes/create-preset#create-a-custom-plugin-preset) that can be used by with  [create-nx-workspace](https://nx.dev/packages/nx/documents/create-nx-workspace#createnxworkspace) to generate a huge Nx workspace.✨

I use that preset for multiple use cases:
- Generate a Nx workspace using the latest version of Nx that look like the current project I am working on and I compare the latest generation with my current workspace to ensure I don't miss new config.
- Used to test new architectures
- Used to test CI config with many projects

## Generate workspace

```bash
$ npx create-huge-nx huge-nx-workspace
```
or by using the preset:

```bash
$ npx create-nx-workspace huge-nx-workspace --preset huge-nx
```

## Development

You need to start the local registry Verdaccio:
```bash
$ pnpm nx local-registry
```
If already published, you first need to unpublish libraries by using:
```bash
$  pnpm unpublish-all
```
Then you'll need to publish the libraries:
```bash
$  pnpm publish-all
```
Then you can use the command above to create the workspace.

