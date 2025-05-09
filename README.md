# Group-1 Project

## Contributing to Project

**1. Clone the repository:**

- Run `git clone [repo]`

**2. Switch to `development` branch:**

- Run `git branch -a` to check that `development` branch exist.
- Run `git checkout development` to switch to `development` branch.

**3. Create your **feature** branch based off the `development` branch:**

- Run `git checkout -b <my-feature>` from `development` branch.

- Work on individual branch and once happy with the changes, **add**, **commit** and **push** to your changes to your **feature** branch. Run `git push -u origin <my-feature>` to push your **feature** branch to Github.

  - Create a PR from your **feature** branch to the **development** branch.

  - Merge the **PR** to `development`.

  - Delete your **feature** branch if you think you do not need this branch in future.

**4. Switch back to development branch and always make sure to pull the latest changes:**

- Run `git checkout development` to switch to **development** branch.
- Run `git pull` to get the latest changes.
- To start new feature: Repeat **Step 3**

**5. If you are still working on **feature** branch and need latest changes from **development** branch:**

- Run `git stash save <"message">` to save the current unpushed changes in **feature** branch.
- Run `git checkout development` to switch to **development** branch.
- Run `git pull` to get the latest changes.
- Run `git checkout <my-feature>` to switch back to **feature** branch.
- Run `git merge development` to include the latest changes in your **feature** branch.
- Run `git stash pop stash@{0}` to apply the stash.
