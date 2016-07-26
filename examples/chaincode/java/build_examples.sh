#
#Copyright DTCC 2016 All Rights Reserved.
#
#Licensed under the Apache License, Version 2.0 (the "License");
#you may not use this file except in compliance with the License.
#You may obtain a copy of the License at
#
#         http://www.apache.org/licenses/LICENSE-2.0
#
#Unless required by applicable law or agreed to in writing, software
#distributed under the License is distributed on an "AS IS" BASIS,
#WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#See the License for the specific language governing permissions and
#limitations under the License.
#

##declarations
BUILDPATH=`pwd`
EXAMPLES_SOURCE=$BUILDPATH/src/main/java
declare -a mainClasses

## remove file
removeFile(){
 if [ -f $1 ];then
  rm $1
 fi
}

## remove folder
removeFolder(){
 if [ -d $1 ];then
  rm -r $1
 fi
}

#find all examples under ./src/main/java
cd $EXAMPLES_SOURCE
for file in `find . -name *.java`;do
  mainMethodPresent=`grep -c "public static void main" $file`
  if [ $mainMethodPresent -ne 1 ];then
    continue
  fi
  className=`echo $file|cut -f2 -d"."| cut -c 2-|tr "/" "."`
  mainClasses+=("$className")
done

cd $BUILDPATH
for className in "${mainClasses[@]}"
do
  removeFolder build
  baseName=`echo $className|rev|cut -f1 -d"."|rev`
  removeFile ${baseName}.zip
  gradle -b build.gradle -DmainClassName=$className -DbaseName=$baseName build
done


