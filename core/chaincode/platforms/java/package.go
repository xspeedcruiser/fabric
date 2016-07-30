package java

import (
	"archive/tar"
	"fmt"
	"os"
	"strings"
	"time"

	cutil "github.com/hyperledger/fabric/core/container/util"
	pb "github.com/hyperledger/fabric/protos"
	"github.com/spf13/viper"
)

//tw is expected to have the chaincode in it from GenerateHashcode.
//This method will just package the dockerfile
func writeChaincodePackage(spec *pb.ChaincodeSpec, tw *tar.Writer) error {

	var urlLocation string
	if strings.HasPrefix(spec.ChaincodeID.Path, "http://") {
		urlLocation = spec.ChaincodeID.Path[7:]
	} else if strings.HasPrefix(spec.ChaincodeID.Path, "https://") {
		urlLocation = spec.ChaincodeID.Path[8:]
	} else {
		urlLocation = spec.ChaincodeID.Path
		//		if !strings.HasPrefix(urlLocation, "/") {
		//			wd := ""
		//			wd, _ = os.Getwd()
		//			urlLocation = wd + "/" + urlLocation
		//		}
	}

	if urlLocation == "" {
		return fmt.Errorf("empty url location")
	}

	if strings.LastIndex(urlLocation, "/") == len(urlLocation)-1 {
		urlLocation = urlLocation[:len(urlLocation)-1]
	}
	urlLocation = urlLocation[strings.LastIndex(urlLocation, "/")+1:]

	var dockerFileContents string

	if viper.GetBool("security.enabled") {
		//todo
	} else {

		var buf []string

		//let the executable's name be chaincode ID's name
		buf = append(buf, viper.GetString("chaincode.java.Dockerfile"))
		buf = append(buf, fmt.Sprintf("RUN gradle -b %s/build.gradle", spec.ChaincodeID.Path))
		buf = append(buf, fmt.Sprintf("RUN unzip -od /root %s/build/distributions/Chaincode.zip", spec.ChaincodeID.Path))

		dockerFileContents = strings.Join(buf, "\n")

	}
	fmt.Println(spec.ChaincodeID.Path)
	fmt.Println(dockerFileContents)

	dockerFileSize := int64(len([]byte(dockerFileContents)))

	//Make headers identical by using zero time
	var zeroTime time.Time
	tw.WriteHeader(&tar.Header{Name: "Dockerfile", Size: dockerFileSize, ModTime: zeroTime, AccessTime: zeroTime, ChangeTime: zeroTime})
	tw.Write([]byte(dockerFileContents))
	err := cutil.WriteJavaProjectToPackage(tw, spec.ChaincodeID.Path)
	if err != nil {
		return fmt.Errorf("Error writing Chaincode package contents: %s", err)
	}
	file, err := os.Create("/tmp/chaincode.tar")
	tr1 := tar.NewWriter(file)
	defer tr1.Close()
	tr1.WriteHeader(&tar.Header{Name: "Dockerfile", Size: dockerFileSize, ModTime: zeroTime, AccessTime: zeroTime, ChangeTime: zeroTime})
	tr1.Write([]byte(dockerFileContents))
	err1 := cutil.WriteJavaProjectToPackage(tr1, spec.ChaincodeID.Path)
	if err1 != nil {
		return fmt.Errorf("Error writing Chaincode package contents: %s", err)
	}

	return nil
}
