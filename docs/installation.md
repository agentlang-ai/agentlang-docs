# Installation

Clone the fractl repo. From the repository folder, run the `install.sh` script to install fractl to a directory of your choice. Add it to the `PATH` environment variable so the `fractl` command is available system-wide.

**Note** In directory names, please replace `myhome` with the name of your home directory.

```shell
$ cd /myhome/projects/fractl
$ ./install.sh /myhome/programs
$ export PATH=$PATH:/myhome/program/fractl-<version>
```

Next we need a place to store our fractl programs. Fractl programs are known as models, because they are very high-level descriptions of the problem being solved. We will store our fractl models under `/myhome/fractl-models`. 
