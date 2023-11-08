# spaceman: retired
Spaceman has served its purpose and is now retired.

This repo doesn't have an issue tracker because we are using Nostrocket to track problems. Please view the problem tracker using [Spacemen](https://nostrocket.github.io/spaceman/)
## Architecture
Spaceman is a Nostrocket client.
Nostrocket Engine is where events are parsed and used to build the current state of Nostrocket.   

Nostrocket Engine subscribes to the Nostrocket Ignition Tree, all events in this thread are parsed against the Nostrocket Protocol. The way it parses events depends on:
- the event Kind and Tags
- the location of the event in the Ignition Tree (which branch of the tree the event is in)

The Nostrocket Engine currently runs separately to the Nostrocket Client (Spaceman). It executes on the OS rather than within the browser. It publishes the *current state* as a *replaceable event* of `kind 10311` and signed by whoever is running the Engine (SHOULD be the same person who's using Spaceman but doesn't have to be).   

Ultimately, this extra step of publishing the current state as an event is fine as a prototype but is clunky and will become redundant if the project works. The Engine should be implemented in Rust and compiled to wasm such that the whole thing can run in a browser and just use `WebAssembly.Memory` to store and share the current state locally in the browser. It could possibly be done in plain TS/JS but: 1) it would probably become pretty slow, and 2) I'd rather self immolate.

### Get Started
0. Install dependencies with `npm install`
1. Run the server locally with `npm run dev`
2. Before commit, run `npm run build` to make sure the static page can be successfullt built.
### Contributing
1. Fork this github repository under your own github account.
2. Clone _your_ fork locally on your development machine.
3. Choose _one_ problem to solve. The problem you choose to solve should exists in Github Issue. If you aren't solving a problem that's already in the issue tracker you should describe the problem there (and your idea of the solution) first to see if anyone else has something to say about it (maybe someone is already working on a solution, or maybe you're doing something wrong).

**It is important to claim the issue you want to work on so that others don't work on the same thing. We are using Github currently until nostrocket is fully built.**

4. Add this repository as an upstream source and pull any changes:
```
git remote add upstream git@github.com:nostrocket/spaceman.git //only needs to be done once
git checkout master //just to make sure you're on the correct branch
git pull upstream master //this grabs any code that has changed, you want to be working on the latest 'version'
git push //update your remote fork with the changes you just pulled from upstream master
```
5. Create a local branch on your machine `git checkout -b branch_name` (it's usually a good idea to call the branch something that describes the problem you are solving). _Never_ develop on the `master` branch, as the `master` branch is exclusively used to accept incoming changes from `upstream:master` and you'll run into problems if you try to use it for anything else.
6. Solve the problem in the absolute most simple and fastest possible way with the smallest number of changes humanly possible. Tell other people what you're doing by putting _very clear and descriptive comments in your code_. 

When you think whatever problem you are solving is really solved, make sure you didn't break anything.

7. Commit your changes to your own fork:
Before you commit changes, you should check if you are working on the latest version (again). Go to the github website and open _your_ fork of the repo, it should say _This branch is up to date with nostrocket/nostrocket.org:master._    
If **not**, you need to pull the latest changes from the upstream mindmachine repository and replay your changes on top of the latest version:
```
@: git stash //save your work locally
@: git checkout master
@: git pull upstream master
@: git push
@: git checkout -b branch_name_stash
@: git stash pop //_replay_ your work on the new branch which is now fully up to date with this repository
```

Note: after running `git stash pop` you should run look over your code again and check that everything still works as sometimes a file you worked on was changed in the meantime. You should also run `make reset` again.

Now you can add your changes:   
```
@: git add changed_file.js //repeat for each file you changed
```

And then commit your changes:
```
@: git commit -m 'problem: <70 characters describing the problem //do not close the '', press ENTER two (2) times
>
>solution: short description of how you solved the problem.' //Now you can close the ''.    
@: git push //this will send your changes to _your_ fork on Github
```    
8. Go to your fork on Github and select the branch you just worked on. Click "pull request" to send a pull request back to the mindmachine repository.
9. Send the pull request, be sure to mention the UID of the Problem from Stackerstan and also the Github issue number with a # symbol at the front.  
10. Go back to the issue, and make a comment:
  ```
    Done in #(PR_NUMBER)
  ```

  The problem's Curator can then test your solution and close the issue if it solves the problem.

#### What happens after I send a pull request?    
If your pull request contains a correct patch (basically if you followed this guide) a maintainer will merge it.
If you want to work on another problem while you are waiting for it to merge simply repeat the above steps starting at Step 4:
```
@: git checkout master
```
