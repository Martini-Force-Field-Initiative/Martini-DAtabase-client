import { Typography, Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import { TutorialMessage } from "./TutorialComponents";
import "./index.css";
import { SectionProps } from "./types";
import LipidPanel_PNG from "./images/system/system_builder_molecule_panel.png";
import LipidMoleculePanel_PNG from "./images/system/system_builder_lipid_panel.png";
import LipidInsanePanel_PNG from "./images/system/system_builder_insane_panel.png";
import SysView_PNG from "./images/system/system_view2.png";
import SysView1_PNG from "./images/system/system_view1.png";
import ForceField_PNG from "./images/system/forcefield.png";
import { ImageMagnify } from "src/Shared";
const useStyles = makeStyles({
  ul: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  li: {
    display: "flex",
    alignItems: "center",
    marginBottom: 8,
    whiteSpace: "nowrap",
  },
  icon: {
    marginRight: 8,
    fontSize: 18,
  },
});

const System = (props: SectionProps) => {
  const classes = useStyles();
  return (
    <div className="container">
      <Typography variant="h2">System Builder</Typography>

      <Typography
        variant="body1"
        style={{ marginTop: "2em", textAlign: "justify" }}
        component="div"
      >
        The system builder tool offered by MAD is a tool that bridges the gap
        between the{" "}
        <a href="https://github.com/Tsjerk/Insane">INSANE sofware</a>[
        <a href="#references">1</a>] and different collection of molecules. The
        INSANE software generates initial coordinates for a large system of
        atoms.
        <span style={{ fontWeight: "bold" }}>
          INSANE is a powerful tool for the generation of phospholipid bilayers
        </span>{" "}
        with optional embedded protein. The user will be able to choose the size
        and composition of the bilayer and other general properties of the
        system. The <span className="MAD_logo">MAD:System Builder</span>{" "}
        provides default setup parameters, but these can largely be overridden
        if a user needs to. The computation of the system will be performed on
        our cluster and an email can be sent to the user upon completion.
      </Typography>

      <div id="summary">
        <Typography
          variant="body1"
          component="div"
          style={{ marginTop: "0.5em" }}
        >
          The following topics will be covered in order to guide you through
          your first use of the{" "}
          <span className="MAD_logo">MAD:System Builder</span>.
        </Typography>
        <Box style={{ marginBottom: "0.5em" }}>
          {" "}
          <a href="#molecule_setup">
            {" "}
            1. Adding molecules to the bilayer{" "}
          </a>{" "}
        </Box>
        <Box style={{ marginBottom: "0.5em" }}>
          {" "}
          <a href="#bilayer_setup"> 2. Setting up the bilayer </a>{" "}
        </Box>
        <Box style={{ marginBottom: "0.5em" }}>
          {" "}
          <a href="#insane_setup">3. INSANE program settings </a>{" "}
        </Box>
        <Box style={{ marginBottom: "0.5em" }}>
          <a href="#system_view">4. Visualizing and using the system </a>
        </Box>
      </div>

      <div className="disclaimer" style={{ width: "75%", marginBottom: "2em" }}>
        <div>
          <i
            className="medium material-icons inline-icon"
            style={{ fontSize: "3em" }}
          >
            person_add
          </i>
        </div>
        <Typography component="div">
          Because the service makes use of our computational resources, it is
          required for you to <a href="/login">sign in</a> to have access to the{" "}
          <span className="MAD_logo">MAD:System Builder</span>
        </Typography>
      </div>

      <div id="molecule_setup">
        <Box
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "4em",
            marginTop: "2em",
            marginBottom: "4em",
          }}
        >
          <Box
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-around",
              gap: "2em",
            }}
          >
            <Typography variant="h4" component="div">
              Adding molecules
            </Typography>
            <Typography variant="body1" component="div">
              By default, no molecule is selected at the startup. You can choose
              the molecule to be inserted in the membrane from three kinds of
              sources:
            </Typography>
            <Box>
              <ul className={classes.ul}>
                <li className={classes.li}>
                  <ArrowForwardIcon />
                  <span className="li_supt" style={{ marginRight: "0.5em" }}>
                    Database of molecules:{" "}
                  </span>{" "}
                  these are all the public molecules currently stored on the MAD
                  server.
                </li>
                <li className={classes.li}>
                  <ArrowForwardIcon />{" "}
                  <span className="li_supt" style={{ marginRight: "0.5em" }}>
                    History:
                  </span>{" "}
                  these are your private molecules that you previously processed
                  in the <a href="/tutorials#molecule">molecule builder</a>.
                </li>
                <li className={classes.li}>
                  <ArrowForwardIcon />{" "}
                  <span className="li_supt" style={{ marginRight: "0.5em" }}>
                    Upload:
                  </span>{" "}
                  the advanced user can upload molecule specific coordinates,
                  topology and itp files.
                </li>
              </ul>
            </Box>
            <Box style={{ maxWidth: "80%" }}>
              <TutorialMessage
                type="info"
                message={
                  <>
                    If the user does not add a molecule, a simple bilayer will
                    be generated. In that case, the user will be prompted to
                    choose a force field version. Otherwise, the force field
                    version is automatically inferred from the chosen/uploaded
                    molecule.
                  </>
                }
              />
            </Box>
            <Box style={{ maxWidth: "80%" }}>
              <TutorialMessage
                type="todo"
                message={
                  <>
                    Please select the{" "}
                    <span style={{ fontWeight: "bold" }}>1pt4</span> from your
                    history and proceed to{" "}
                    <span style={{ fontWeight: "bold" }}>NEXT</span> section.
                  </>
                }
              />
            </Box>
          </Box>
          <Box style={{ flex: 1 }}>
            <ImageMagnify
              src={LipidPanel_PNG}
              alt="startup_system"
              width={90}
              preWidth="350px"
            />
          </Box>
        </Box>
      </div>

      <div id="forcefield_choice">
        <Typography variant="h4"> Force Field Selection</Typography>
        <Box
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "4em",
            marginTop: "2em",
            marginBottom: "4em",
          }}
        >
          <Box
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4em",
              marginTop: "2em",
              marginBottom: "4em",
              flex: 1,
            }}
          >
            <Box>
              <Typography component="div" variant="body1">
                At this stage, select the force field that will be used to model
                your system. Two options are available:
              </Typography>
            </Box>
            <Box>
              <ul className={classes.ul}>
                <li className={classes.li}>
                  <ArrowForwardIcon />
                  <span className="li_supt" style={{ marginRight: "0.5em" }}>
                    Martini 3 standard parameters (martini3001):{" "}
                  </span>
                  This corresponds to the original{" "}
                  <a
                    style={{ margin: "0.3em" }}
                    href="https://doi.org/10.1038/s41592-021-01098-3"
                    target="_blank"
                  >
                    Martini 3 force field.
                  </a>
                </li>
                <li className={classes.li}>
                  <ArrowForwardIcon />{" "}
                  <span className="li_supt" style={{ marginRight: "0.5em" }}>
                    Martini 3 lipidome parameters
                  </span>{" "}
                  This parameter set that extends the Martini 3 force field with
                  <a
                    style={{ margin: "0.3em" }}
                    href="https://doi.org/10.1021/acscentsci.5c00755"
                    target="_blank"
                  >
                    improved and newly developed lipid models.
                  </a>
                </li>
              </ul>
            </Box>
            <Box>
              <TutorialMessage
                type="info"
                icon=<i className="material-icons inline-icon">lock_open</i>
                message={
                  <>
                    <b>Martini 3 lipidome parameters</b> are fully compatible
                    with the standard martini3001 parameters and is recommended
                    when working with complex or diverse lipid compositions.
                  </>
                }
              />
            </Box>
          </Box>
          <Box style={{ flex: 1 }}>
            <ImageMagnify
              src={ForceField_PNG}
              alt="forcefield_system_menu"
              width={90}
              preWidth="550px"
            />
          </Box>
        </Box>
      </div>

      <div id="bilayer_setup">
        <Box
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "4em",
            marginTop: "2em",
            marginBottom: "4em",
          }}
        >
          <Box
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-around",
              gap: "2em",
            }}
          >
            <Typography variant="h4" component="div">
              Setting the bilayer compostion
            </Typography>
            <Typography variant="body1" component="div">
              By default, you must select at least one type of lipids and the
              lower and upper leaflets have identical composition. You can
              modify the lipid bilayer composition or even remove it entirely
              with the following options:
            </Typography>
            <Box>
              <ul className={classes.ul}>
                <li className={classes.li}>
                  <ArrowForwardIcon />
                  <span className="li_supt" style={{ marginRight: "0.5em" }}>
                    Toggle the addition of lipids:{" "}
                  </span>
                  If set to <b style={{ margin: "0 0.3em" }}>no</b> the system
                  will be a box of water with no lipid bilayer
                </li>
                <li className={classes.li}>
                  <ArrowForwardIcon />{" "}
                  <span className="li_supt" style={{ marginRight: "0.5em" }}>
                    Add Lipid:
                  </span>{" "}
                  different phospholipds to be added to the bilayer composition.
                  Individual type and ratio can be set.
                </li>
                <li className={classes.li}>
                  <ArrowForwardIcon />{" "}
                  <span className="li_supt" style={{ marginRight: "0.5em" }}>
                    Separate lower and upper leaflet:
                  </span>{" "}
                  set up common or separated lipid compositions for the two
                  leaflets.
                </li>
              </ul>
            </Box>
            <Box style={{ maxWidth: "80%" }}>
              <TutorialMessage
                type="todo"
                message={
                  <>
                    Please select a separate lipid composition of 1 DIPC and 1
                    DLPC for the upper and lower leaflets respectively. Then
                    proceed to <span style={{ fontWeight: "bold" }}>NEXT</span>{" "}
                    section.
                  </>
                }
              />
            </Box>
          </Box>
          <Box style={{ flex: 1 }}>
            <ImageMagnify
              src={LipidMoleculePanel_PNG}
              alt="startup_system"
              width={90}
              preWidth="450px"
            />
          </Box>
        </Box>
      </div>

      <div id="insane_setup">
        <Box
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "4em",
            marginTop: "2em",
            marginBottom: "4em",
          }}
        >
          <Box
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              gap: "3.5em",
            }}
          >
            <Typography variant="h4" component="div">
              INSANE program settings
            </Typography>
            <Typography variant="body1" component="div">
              Here you can modify the execution parameters of the INSANE
              software. Default parameters are preselected to ensure a safe
              generation of the system coordinates. Still, many options are
              available should you require additional setup conditions.
            </Typography>
            <Box>
              <TutorialMessage
                type="warning"
                message={
                  <>
                    Extreme values for some parameters may cause the INSANE
                    software to early exit out of errors.
                    <span style={{ fontWeight: "initial" }}>
                      In such cases, MAD will warn you and you will be able to
                      retry with other parameter values.
                    </span>
                  </>
                }
              />
            </Box>
            <Box>
              <ul className={classes.ul}>
                <li className={classes.li}>
                  <ArrowForwardIcon />
                  <span className="li_supt" style={{ marginRight: "0.5em" }}>
                    Periodic boundary conditions:{" "}
                  </span>{" "}
                  Set the geometry and dimensions of the simulation box.
                </li>
                <li className={classes.li}>
                  <ArrowForwardIcon />{" "}
                  <span className="li_supt" style={{ marginRight: "0.5em" }}>
                    Lipid options:
                  </span>{" "}
                  Define the membrane lipid spacing for the molecules
                  distribution across the bilayer.
                </li>
                <li className={classes.li}>
                  <ArrowForwardIcon />{" "}
                  <span className="li_supt" style={{ marginRight: "0.5em" }}>
                    Inserted molecule options:
                  </span>{" "}
                  Place the molecule at the bilayer center, eventually orienting
                  it.
                </li>
                <li className={classes.li}>
                  <ArrowForwardIcon />{" "}
                  <span className="li_supt" style={{ marginRight: "0.5em" }}>
                    Water, salt and solvent options:
                  </span>{" "}
                  Define system total charge, salt concentration and solvent
                  type.
                </li>
              </ul>
            </Box>
            <Box style={{ maxWidth: "100%" }}>
              <TutorialMessage
                type="info"
                icon=<i className="material-icons inline-icon">lock_open</i>
                message={
                  <>
                    For experienced INSANE users, specific options are available
                    through the <span>ADVANCE SETTINGS</span> panel. These
                    options won't be covered in this tutorial as they required
                    advanced knowledge of the INSANE program.
                  </>
                }
              />
            </Box>
            <Box style={{ maxWidth: "100%" }}>
              <TutorialMessage
                type="todo"
                message={
                  <>
                    You can leave all values to default and proceed to{" "}
                    <span className="command">CREATE SYSTEM</span>
                  </>
                }
              />
            </Box>
          </Box>
          <Box style={{ flex: 1 }}>
            <ImageMagnify
              src={LipidInsanePanel_PNG}
              alt="startup_system"
              width={90}
              preWidth="400px"
            />
          </Box>
        </Box>
      </div>

      <div id="system_view">
        <Typography variant="h4">Visualizing and using the system</Typography>
        <Box
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4em",
            marginTop: "2em",
            marginBottom: "4em",
          }}
        >
          <Typography component="div" variant="body1">
            The viewer section of the{" "}
            <span className="MAD_logo">MAD:System Builder</span> allows for a
            final visual inspection of the system. The molecular structures of
            the molecules are displayed in the leaflets and the surrounding
            water. Water molecules can be shown, with proper coloring for the
            charged ions (bottom left). Membrane lipids and the embeded protein
            are displayed in ball and sitck representation (lower right). A size
            reduction is applied to the actual Martini3 beads to avoid the
            cluttering of representation.
          </Typography>

          <Box
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "4em",
              marginTop: "2em",
              marginBottom: "4em",
            }}
          >
            <Box style={{ flex: 1 }}>
              <ImageMagnify
                src={SysView_PNG}
                alt="startup_system"
                width={90}
                preWidth="450px"
              />
            </Box>
            <Box style={{ flex: 1 }}>
              <ImageMagnify
                src={SysView1_PNG}
                alt="startup_system"
                width={90}
                preWidth="450px"
              />
            </Box>
          </Box>
          <Box style={{ maxWidth: "75%" }}>
            <TutorialMessage
              type="todo"
              message={
                <>
                  Retrieve you molecular dynamic input files in <i>itp, pdb</i>{" "}
                  and <i>gro</i> formats with the <b>DOWNLOAD</b> link
                </>
              }
            />
          </Box>
        </Box>
      </div>

      <div id="references">
        <Typography variant="h4">References</Typography>
        <ol>
          <li>
            Wassenaar T.A., Ingólfsson H.I., Böckmann R.A. et al.Computational
            Lipidomics with insane: A Versatile Tool for Generating Custom
            Membranes for Molecular Simulations. J. Chem Theory Comput (2015)
            11, 2144-2155. doi : 10.1021/acs.jctc.5b00209
          </li>
        </ol>
      </div>
    </div>
  );
};

export default System;
