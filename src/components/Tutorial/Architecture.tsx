import { Typography, Box } from "@material-ui/core";

import "./index.css";
import { SectionProps } from "./types";
import overallView from "./images/architecture/mad_overall.png";
import moleculeAdd from "./images/architecture/mad_molecule_add.png";
import martinize2 from "./images/architecture/mad_martinize2.png";
import sysBuilder from "./images/architecture/mad_sys_builder.png";
import { ImageMagnify } from "src/Shared";
const Architecture = (props: SectionProps) => {
  return (
    <div className="container" style={{ paddingTop: "2em" }}>
      <Typography variant="h2">MAD Server&Ressources Architecture</Typography>

      <Box>
        <Typography
          variant="h4"
          component="div"
          style={{ marginBottom: "0.5em", marginTop: "2em" }}
        >
          {" "}
          Overall View
        </Typography>
        <Box
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            gap: "2em",
          }}
        >
          <Box style={{ flex: 3 }}>
            <ImageMagnify
              src={overallView}
              preWidth="900px"
              alt="overall_view"
              width={90}
            />
          </Box>

          <Box style={{ flex: 2 }}>
            <div
              className="info"
              style={{ display: "flex", gap: "1em", alignItems: "center" }}
            >
              <div>
                <i
                  style={{ fontSize: "3rem" }}
                  className="material-icons inline-icon"
                >
                  info_outline
                </i>
              </div>
              <div style={{ textAlign: "justify", padding: "1em" }}>
                The MAD server is built on a front end to back-end architecture.
                The front end, which is based on the version 16.9 of the React
                web component framework, carries most of the steps for the
                submission, validation, visualization, and edition of structure.
                The MOBI:jobmanager client library represents scheduled task
                organizations and pipelines as native JavaScript objects. This
                allows to setup calculations, and access to results inside the
                runtime of the nodeJS/express server instance. The computational
                resource regroups an HPC cluster with the required software
                installed which stands behind a single "broker" computer running
                the server instance of the MOBI:job-manager service. The NoSQL
                database is an apache:CouchDB instance running on a dedicated
                computer.
              </div>
            </div>
          </Box>
        </Box>
      </Box>

      <Box>
        <Typography
          variant="h4"
          component="div"
          style={{ marginBottom: "0.5em", marginTop: "2em" }}
        >
          {" "}
          MAD logic: molecule creation and addition
        </Typography>
        <Box
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            gap: "2em",
          }}
        >
          <Box style={{ flex: 3 }}>
            <ImageMagnify
              src={moleculeAdd}
              preWidth="900px"
              alt="overall_view"
              width={90}
            />
          </Box>

          <Box style={{ flex: 2 }}>
            <div
              className="info"
              style={{ display: "flex", gap: "1em", alignItems: "center" }}
            >
              <div>
                <i
                  style={{ fontSize: "3rem" }}
                  className="material-icons inline-icon"
                >
                  info_outline
                </i>
              </div>
              <div style={{ textAlign: "justify", padding: "1em" }}>
                Adding a molecule to the database is done through the client
                interface for logged in users. Any registered user can submit a
                molecule. Depending on the existence of a previous version of
                the molecule with the specified force field, a new entry may be
                created. A GROMACS run will build coordinate files with complete
                connectivity. Upon its completion MAD curators will be sought
                for validation. Finally, all the CG structure files will be
                saved permanently on the MAD file system and database will be
                updated and changes will be reflected in the client instance.
              </div>
            </div>
          </Box>
        </Box>
      </Box>

      <Box>
        <Typography
          variant="h4"
          component="div"
          style={{ marginBottom: "0.5em", marginTop: "2em" }}
        >
          {" "}
          Computational architecture of the Molecule Builer tool
        </Typography>
        <Box
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            gap: "2em",
          }}
        >
          <Box style={{ flex: 3 }}>
            <ImageMagnify
              src={martinize2}
              preWidth="900px"
              alt="overall_view"
              width={90}
            />
          </Box>

          <Box style={{ flex: 2 }}>
            <div
              className="info"
              style={{ display: "flex", gap: "1em", alignItems: "center" }}
            >
              <div>
                <i
                  style={{ fontSize: "3rem" }}
                  className="material-icons inline-icon"
                >
                  info_outline
                </i>
              </div>
              <div style={{ textAlign: "justify", padding: "1em" }}>
                The client interface will guide the user through the upload of
                all-atom coordinates and the setup of the coarse graining
                process. Such a process may be long depending on the amount of
                input atoms, therefore all subsequent communications between
                client and server will be socket-based. The Molecule Builder
                pipeline combines software around martinize2 to provide the
                client with all the necessary resources to further edit the CG
                files, making modification of distance restraints for example
                much simpler.
              </div>
            </div>
          </Box>
        </Box>
      </Box>

      <Box>
        <Typography
          variant="h4"
          component="div"
          style={{ marginBottom: "0.5em", marginTop: "2em" }}
        >
          {" "}
          Computational architecture of the System Builder tool
        </Typography>
        <Box
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            gap: "2em",
          }}
        >
          <Box style={{ flex: 3 }}>
            <ImageMagnify
              src={sysBuilder}
              preWidth="900px"
              alt="overall_view"
              width={90}
            />
          </Box>

          <Box style={{ flex: 2 }}>
            <div
              className="info"
              style={{ display: "flex", gap: "1em", alignItems: "center" }}
            >
              <div>
                <i
                  style={{ fontSize: "3rem" }}
                  className="material-icons inline-icon"
                >
                  info_outline
                </i>
              </div>
              <div style={{ textAlign: "justify", padding: "1em" }}>
                The System builder accepts the following type of resources for
                the molecule to be inserted: CG files uploaded by the user,
                molecule found in the database, a molecule previously processed
                by the Molecule Builder. Because the Insane execution may be
                long depending on the size of the system, all subsequent
                communications between client and server will be socket-based.
                The System builder pipeline combines Insane and GROMACS to
                provide the client with all the necessary files to run MD
                simulation of the chosen system.
              </div>
            </div>
          </Box>
        </Box>
      </Box>

      <Box>
        <Typography
          variant="h4"
          component="div"
          style={{ marginBottom: "0.5em", marginTop: "2em" }}
        >
          {" "}
          Computational architecture of the Polymer Editor Tool
        </Typography>
        Coming soon
      </Box>

      {/*
      <div className="schematics">
        <h4>MAD logic: molecule creation and addition</h4>
        <img src={moleculeAdd} style={{ width: "650px" }} />
        <div className="comments">
          Adding a molecule to the database is done through the client interface
          for logged in users. Any registered user can submit a molecule.
          Depending on the existence of a previous version of the molecule with
          the specified force field, a new entry may be created. A GROMACS run
          will build coordinate files with complete connectivity. Upon its
          completion MAD curators will be sought for validation. Finally, all
          the CG structure files will be saved permanently on the MAD file
          system and database will be updated and changes will be reflected in
          the client instance.
        </div>
      </div>

      <div className="schematics">
        <h4>Computational architecture of the Molecule Builer tool</h4>
        <img src={martinize2} style={{ width: "650px" }} />
        <div className="comments">
          The client interface will guide the user through the upload of
          all-atom coordinates and the setup of the coarse graining process.
          Such a process may be long depending on the amount of input atoms,
          therefore all subsequent communications between client and server will
          be socket-based. The Molecule Builder pipeline combines software
          around martinize2 to provide the client with all the necessary
          resources to further edit the CG files, making modification of
          distance restraints for example much simpler.
        </div>
      </div>
      <div className="schematics">
        <h4>Computational architecture of the System Builder tool</h4>
        <img src={sysBuilder} style={{ width: "650px" }} />
        <div className="comments">
          The System builder accepts the following type of resources for the
          molecule to be inserted: CG files uploaded by the user, molecule found
          in the database, a molecule previously processed by the Molecule
          Builder. Because the Insane execution may be long depending on the
          size of the system, all subsequent communications between client and
          server will be socket-based. The System builder pipeline combines
          Insane and GROMACS to provide the client with all the necessary files
          to run MD simulation of the chosen system.
        </div>
      </div>
      */}

      <Box>
        <Typography
          variant="h4"
          component="div"
          style={{ marginBottom: "0.5em", marginTop: "2em" }}
        >
          {" "}
          MAD software resources
        </Typography>
        <Typography variant="body1" component="div">
          Besides React and nodeJS, MAD makes use of the following softwares and
          libraries:
        </Typography>
        <ul className="fa-ul">
          <li>
            <span className="fa-li">
              <i className="fas fa-check-square"></i>
            </span>
            <a href="https://github.com/MMSB-MOBI/martinize-db">
              MAD Back-end code base
            </a>
          </li>
          <li>
            <span className="fa-li">
              <i className="fas fa-check-square"></i>
            </span>
            <a href="https://github.com/MMSB-MOBI/martinize-db-client">
              MAD Front-end code base
            </a>
          </li>
          <li>
            <span className="fa-li">
              <i className="fas fa-check-square"></i>
            </span>
            <a href="https://github.com/MMSB-MOBI/ms-jobmanager">
              MOBI Pipeline ans scheduling framework
            </a>
          </li>
          <li>
            <span className="fa-li">
              <i className="fas fa-check-square"></i>
            </span>
            <a href="https://github.com/marrink-lab/vermouth-martinize">
              Vermouth martinize Coarse graining library
            </a>
          </li>
          <li>
            <span className="fa-li">
              <i className="fas fa-check-square"></i>
            </span>
            <a href="https://github.com/Tsjerk/Insane">The Insane software</a>
          </li>
          <li>
            <span className="fa-li">
              <i className="fas fa-check-square"></i>
            </span>
            <a href="https://www.gromacs.org/">
              The gromacs MD engine and output analysis suite
            </a>
          </li>
        </ul>
      </Box>

      {/*
      <div className="schematics">
        <h4>MAD software resources</h4>
        <div className="comments">
          Besides React and nodeJS, MAD makes use of the following softwares and
          libraries:
          <ul className="fa-ul">
            <li>
              <span className="fa-li">
                <i className="fas fa-check-square"></i>
              </span>
              <a href="https://github.com/MMSB-MOBI/martinize-db">
                MAD Back-end code base
              </a>
            </li>
            <li>
              <span className="fa-li">
                <i className="fas fa-check-square"></i>
              </span>
              <a href="https://github.com/MMSB-MOBI/martinize-db-client">
                MAD Front-end code base
              </a>
            </li>
            <li>
              <span className="fa-li">
                <i className="fas fa-check-square"></i>
              </span>
              <a href="https://github.com/MMSB-MOBI/ms-jobmanager">
                MOBI Pipeline ans scheduling framework
              </a>
            </li>
            <li>
              <span className="fa-li">
                <i className="fas fa-check-square"></i>
              </span>
              <a href="https://github.com/MMSB-MOBI/ms-jobmanager">
                Vermouth martinize Coarse graining library
              </a>
            </li>
            <li>
              <span className="fa-li">
                <i className="fas fa-check-square"></i>
              </span>
              <a href="https://github.com/Tsjerk/Insane">The Insane software</a>
            </li>
            <li>
              <span className="fa-li">
                <i className="fas fa-check-square"></i>
              </span>
              <a href="https://www.gromacs.org/">
                The gromacs MD engine and output analysis suite
              </a>
            </li>
          </ul>
        </div>
      </div>
       */}
    </div>
  );
};

export default Architecture;
