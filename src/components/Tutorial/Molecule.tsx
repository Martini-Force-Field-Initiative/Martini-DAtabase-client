import { Typography, Box } from "@material-ui/core";

import "./index.css";
import { SectionProps } from "./types";
import { ImageMagnify } from "../../Shared";
import martinizeAllAtoms from "./images/molecule/martinize_all_atoms.png";
import martinizeCG from "./images/molecule/martinize_cg.png";
import martinizeCG_colors from "./images/molecule/martinize_cg_color.png";
import martinizeElastic from "./images/molecule/martinize_elastic.png";
import martinizeElastic_2 from "./images/molecule/martinize_elastic2.png";
import martinizeSelect_1 from "./images/molecule/martinize_elastic_select1.png";
import martinizeSelect_bond from "./images/molecule/martinize_elastic_bond.png";
import martinizeElasticGroup from "./images/molecule/martinize_elastic_groups.png";
import martinize_GO from "./images/molecule/martinize_go.png";
import martinize_GO_2 from "./images/molecule/martinize_go_2.png";
import martinize_GO_3 from "./images/molecule/martinize_go_3.png";
import history_PNG from "./images/molecule/history.png";
import martini_IDP from "./images/molecule/martini_IDP.png";
const Molecule = (props: SectionProps) => {
  return (
    <div className="container">
      <Typography variant="h2">Molecule Builder</Typography>
      <div id="header" style={{ marginTop: "1.5em" }}>
        <Typography variant="body1" component="div">
          The Molecule Builder section of MAD is the main entry point to obtain
          the coarse grained representation of your molecule of interest. Its
          most basic feature, is a wrapper around the{" "}
          <a
            href="https://github.com/marrink-lab/vermouth-martinize"
            target="_blank"
          >
            vermouth-martinize
          </a>
          [<a href="#references">1</a>] software. In practice, the{" "}
          <span className="MAD_logo">MAD:Molecule Builder</span> introduces many
          powerful features, such as interactive edition of distance
          constraints, that facilitate and add controls to the coarse graining
          process.
        </Typography>
      </div>

      <div id="summary">
        <p>
          The following topics will be covered in order to guide you through
          your first use of the{" "}
          <span className="MAD_logo">MAD:Molecule Builder</span>.
        </p>{" "}
        <Box style={{ marginBottom: "0.5em" }}>
          <a href="#classic">
            {" "}
            1. Classic mode with a single chain molecule{" "}
          </a>{" "}
        </Box>
        <Box style={{ marginBottom: "0.5em" }}>
          <a href="#elastic"> 2. Protein with elastic network </a>{" "}
        </Box>
        <Box style={{ marginBottom: "0.5em" }}>
          <a href="#go">3. Protein with GO model </a>{" "}
        </Box>
        <Box style={{ marginBottom: "0.5em" }}>
          <a href="#disordered">4. Protein disordered regions of </a>
        </Box>
        <Box style={{ marginBottom: "0.5em" }}>
          <a href="#history">5. Browse my builds through history </a>
        </Box>
      </div>

      <div className="disclaimer" style={{ width: "75%", marginBottom: "2em" }}>
        <div>
          <i className="medium material-icons inline-icon">person_add</i>
        </div>
        <div>
          Because the <span className="MAD_logo">MAD:Molecule Builder</span>{" "}
          makes use of our computational resources, it is required that you{" "}
          <a href="/login">sign in</a> in order to access it.
        </div>
      </div>

      <div id="classic">
        <Typography variant="h4" gutterBottom>
          Classic mode with a single chain protein
        </Typography>

        <Box
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "2em",
            alignItems: "stretch", // 🔥 makes columns same height
          }}
        >
          {/* LEFT COLUMN (3 rows) */}
          <Box
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-evenly", // 🔥 spreads the 2 rows
              flex: 1,
            }}
          >
            <Typography variant="subtitle2" component="div">
              Upon authentication to the MAD website, the{" "}
              <i className="fas fa-lg fa-atom"></i>{" "}
              <span style={{ fontWeight: "bold" }}>Molecule Builder</span>{" "}
              option should toggle to black, marking it as accessible. Click on
              it to access to the{" "}
              <span className="MAD_logo">MAD:Molecule Builder</span> welcome
              page. Here you will be invited to upload a coordinate file.
            </Typography>

            <Box className="todo">
              <div>
                <i className="medium material-icons inline-icon">launch</i>
              </div>
              <div>
                The <span className="MAD_logo">MAD:Molecule Builder</span>{" "}
                requires a single PDB file as input. We will use as example, the
                Neisserial surface protein A (NspA) from the bacterium Neisseria
                meningitidis, which forms a transmembrane beta barrel. It is a
                single chain membrane protein. Its atomistic structure can be
                downloaded from the PDB web site{" "}
                <a href="https://files.rcsb.org/download/1P4T.pdb">
                  {" "}
                  under the code 1P4T{" "}
                </a>{" "}
                .
              </div>
            </Box>
            <Typography variant="subtitle2" component="div">
              Once loaded, the all atom structure is displayed and the interface
              displays several options to configure the coarse-graining process
              of the structure.
            </Typography>
          </Box>

          {/* RIGHT COLUMN (image) */}
          <Box
            style={{
              flex: 2,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ImageMagnify
              src={martinizeAllAtoms}
              alt="CG_colors"
              width={90}
              preWidth="600px"
            />
          </Box>
        </Box>
      </div>

      <Box
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "3em",
          alignItems: "stretch", // 🔥 makes columns same height
        }}
      >
        <Box
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ul className="show show_tab item_bullets">
            <li>
              <span className="li_supt">Force field:</span> choose the version
              of MARTINI that you plan to use during your molecular dynamics
              simulation.
            </li>
            <li>
              <span className="li_supt">Position restraints:</span> generally
              useful during the equilibration simulation of the molecule, in
              order to maintain the structure of the backbone.
            </li>
            <li>
              <span className="li_supt">Mode:</span> Search for molecule within
              the selected biochemical category
            </li>
          </ul>
        </Box>
        <Box
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ul className="show show_tab item_bullets">
            <li>
              <span className="li_supt">termini and fixes:</span> patches
              molecular beads to improve representations of functional groups
              charges and geometries.
            </li>
            <li>
              <span className="li_supt">Cystein bridges:</span> detect and apply
              covalent bonds between cysteine side-chains based on distances.
            </li>
            <li>
              <span className="li_supt">Email:</span> In case of a long running
              computation, email can be sent upon completion. The email will
              enclose a link to access and visualize your data. Your data are
              privately stored on the server for a period of 15 days.
            </li>
          </ul>
        </Box>
      </Box>
      <Box
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          className="todo"
          style={{
            width: "90%",
            textAlign: "justify",
            padding: "1.5em",
          }}
        >
          <div>
            <i className="small material-icons inline-icon">launch</i>
          </div>
          <div>
            Set the force field parameter to the 3.0.0.1 version of Martini. We
            will use the classic mode, alternative modes will be explored later
            on. All remaining options will be left in default state: neutral
            termini, no side-chain fix, and no cysteine bridge. Then proceed to
            the submission of the protein.
          </div>
        </div>
      </Box>
      <Box
        style={{
          marginTop: "2em",
          marginBottom: "1em",
          fontSize: "1.25em",
        }}
      >
        The <span className="MAD_logo">MAD:Molecule Builder</span> should take a
        few seconds to generate a MARTINI model of NspA.
      </Box>

      <Box
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "3em",
          alignItems: "stretch", // 🔥 makes columns same height
        }}
      >
        {/* LEFT COLUMN (2 rows) */}
        <Box
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-evenly", // 🔥 spreads the 2 rows
            flex: 1,
          }}
        >
          <Typography variant="subtitle2" component="div">
            Feel free to explore the several representation options provided to
            visualize the newly coarse-grained protein.
            <ul className="show show_tab item_bullets">
              <li>Change the beads radius by a factor</li>
              <li>Select other representations such as surface.</li>
              <li>
                Modify all atoms and coarse grain representation opacities.
              </li>
              <li>
                Set Bead radius scaled according to Martini 3 definitions.
              </li>
            </ul>
          </Typography>

          <Box style={{ textAlign: "justify" }}>
            <div className="info">
              <i className="material-icons inline-icon">info_outline</i>
              Martini 3 force field has 3 bead sizes which are mainly defined by
              the number of non-hydrogen atoms represented by the bead: regular
              (<b>R</b>) size for 4 atoms mapped by 1 bead (or 4-1), small (
              <b>S</b>) size for 3-1 and tiny size(<b>T</b>) for 2-1 mappings.
              The unscaled radius of the R, S and T beads in Martini 3
              corresponds to 0.264, 0.230 and 0.191 nm, respectively.
            </div>
          </Box>
        </Box>

        <Box
          style={{
            flex: 2,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ImageMagnify
            src={martinizeCG}
            alt="CG_colors"
            width={90}
            preWidth="700px"
          />
          {/*   <img src={martinizeCG_colors} style={{ maxWidth: "100%" }} /> */}
        </Box>
      </Box>
      <Box style={{ marginTop: "2em", marginBottom: "1.5em" }}>
        <Typography variant="body1">
          Color scale goes from cyan to white to orange to show hydrophobicity
          of beads. Cyan beads have low hydrophobicity value and orange beads
          have high hydrophobicity value.
        </Typography>
      </Box>

      <Box
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "3em",
          alignItems: "stretch",
        }}
      >
        <Box
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "stretch",
            flexDirection: "column",
            gap: "2em",
          }}
        >
          <div className="info" style={{ textAlign: "justify" }}>
            <i className="material-icons inline-icon">info_outline</i>
            The Martini3 model features 3 main chemical classes of neutral
            beads: <b>C</b> for apolar/ hydrophobic,
            <b>N</b> for intermediate and <b>P</b> for polar/hydrophilic. Each
            class has 6 beads with a number as suffix. This number represents
            the degree of hydrophobicity of the bead: ranging from 1 (more
            hydrophobic) to 6 (less hydrophobic). The color scale represents the
            hydrophobicity. As a rule of thumb, C beads will be represented by
            orange hues, N by white and P by cyan.
          </div>
          <div className="info" style={{ textAlign: "justify" }}>
            <i className="material-icons inline-icon">info_outline</i>
            There are 2 classes of charged beads in MARTINI 3: <b>Q</b> beads
            for monovalent +1/-1 charged molecules and <b>D</b> beads for
            divalent charged molecules. While Q beads also have five degrees of
            hydrophobicity, the color code for charged beads in MAD will only
            account for the sign of the charge. Positively charged beads are
            blue and negatively charged beads are red.
          </div>
        </Box>
        <Box
          style={{
            flex: 2,
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <ImageMagnify
            src={martinizeCG_colors}
            width={90}
            alt="martinitCG_colors"
            preWidth="800px"
          />
        </Box>
      </Box>

      <div id="elastic" style={{ marginTop: "2em" }}>
        <Typography variant="h4" gutterBottom>
          Protein with elastic network{" "}
        </Typography>
      </div>
      <Box style={{ marginBottom: "2.5em", textAlign: "justify" }}>
        <Typography variant="body1">
          The elastic network approach consist of a set of harmonic potentials
          added on top of the Martini model to conserve the tertiary structure
          of proteins. The network is fully dependent of the pdb structure used
          as reference, with the number of bonds defined by the upper and lower
          distance cutoff. The rigidity of the protein model is defined by the
          number of elastic bonds and by the force constant used. Optimal
          parameters for the elastic network depend of the protein system in
          study. It is recommended to use experimental or atomistic simulations
          data to calibrate the parameters of your elastic network. To
          illustrate the interests of the elastic network tool in{" "}
          <span className="MAD_logo">MAD:Molecule Builder</span>
          we will use the T4 Lysozyme protein from the bacteriophage T4.
        </Typography>
      </Box>
      <Box
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "3em",
          alignItems: "stretch",
        }}
      >
        <Box
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "stretch",
            flexDirection: "column",
            paddingBottom: "2em",
          }}
        >
          <div
            className="todo"
            style={{
              marginBottom: "2em",
              marginTop: "2em",
              textAlign: "justify",
            }}
          >
            <div>
              <i className="small material-icons inline-icon">launch</i>
            </div>
            <div>
              Download the corresponding{" "}
              <a href="https://files.rcsb.org/download/181L.pdb">
                PDB structure
              </a>
              . Then, go back to the{" "}
              <span className="MAD_logo">MAD:Molecule Builder</span> welcome
              screen and load this file.
            </div>
          </div>

          <div style={{ textAlign: "justify" }}>
            <p style={{ marginBottom: "2em" }}>
              For T4 Lysozyme in MARTINI 3, after setting <i>Force field</i> to
              "martini3001" and <i>Mode</i> to "Elastic", we recommend the
              following parameters:
            </p>
            <ul className="show show_tab item_bullets">
              <li>A force constant of 700 kJ/(mol.nm2)</li>
              <li>Lower and upper cutoff of 0.5 and 0.9 nm respectively</li>
              <li>
                Use neutral termini, side-chain fix, and auto assignment of
                cysteine bridges
              </li>
              <li>Activate the side chain fix</li>
            </ul>
          </div>
          <div className="info" style={{ gridColumn: "1 / 5" }}>
            <i className="material-icons inline-icon">info_outline</i>
            Additional improvements of the protein stability and reliability of
            its structures and dynamics are achieved by applying the side chain
            fix option, which adds dihedral angles between SC1-BB-BB-SC1 beads,
            leading to an improvement of the overall side chain orientations.
          </div>
        </Box>
        <Box
          style={{
            flex: 2,
            justifyContent: "center",
            alignItems: "stretch",
          }}
        >
          <ImageMagnify
            src={martinizeElastic}
            alt="martinizeElastic"
            width={90}
            preWidth="800px"
          />
        </Box>
      </Box>
      <Box
        style={{
          fontSize: "1.25em",
          marginTop: "2em",
          justifyContent: "center",
          display: "flex",
        }}
      >
        <div className="todo">
          <div>
            <i className="small material-icons inline-icon">launch</i>
          </div>
          <div>
            The protein is ready to be coarse grained. Click on the{" "}
            <b>SUBMIT</b> and wait for the processing to finish.
          </div>
        </div>
      </Box>
      <Box
        style={{
          textAlign: "justify",
          marginTop: "2em",
          marginBottom: "1.25em",
        }}
      >
        <Typography variant="body1">
          You should have access to a viewer of the coarse grained protein with
          its elastic network represented by green links between beads.
        </Typography>
      </Box>
      <Box
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "3em",
          alignItems: "stretch",
        }}
      >
        <Box
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "stretch",
            flexDirection: "column",
            paddingBottom: "2em",
          }}
        >
          <div>
            <p style={{ marginBottom: "2em" }}>
              The <span className="MAD_logo">MAD:Molecule Builder</span>{" "}
              provides two edition modes of the elastic network.
            </p>
            <ul className="show show_tabitem_bullets">
              <li>
                <b>Manual edition:</b> click on a single bead to remove all its
                elastic bonds, or add a new bond by clicking on another bead. A
                direct click on a bond allows to delete it.
              </li>
              <li>
                <b> Group selection:</b> select a group of beads and linking
                them all together, or select two groups to add elastic bonds
                between each other beads.
              </li>
            </ul>
            All modifications done to the elastic network in your current
            session are logged in the{" "}
            <span style={{ display: "inline-block" }}>
              <i className="fas fa-history"></i> <b>History</b>
            </span>{" "}
            section.
          </div>

          <div className="info">
            <i className="material-icons inline-icon">info_outline</i>
            The group selection tool implements a simple query language. For
            example, selecting “05-10:A” as group 1 and “145-158:A” as group 2,
            will toggle links between the two groups.
          </div>
        </Box>

        <Box
          style={{
            flex: 2,
            justifyContent: "center",
            alignItems: "stretch",
          }}
        >
          <ImageMagnify
            src={martinizeElastic_2}
            alt="martinizeElastic_2"
            width={90}
            preWidth="800px"
          />
        </Box>
      </Box>

      {/* starts hrre */}

      <Box
        style={{
          padding: "2em",
          border: "solid 2px forestgreen",
          borderRadius: "30px",
        }}
      >
        <Box
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "2em",
            marginTop: "2em",
          }}
        >
          {/* LEFT SIDE */}{" "}
          <Box
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "1.5em",
              justifyContent: "space-between", // <-- add this
            }}
          >
            <Box
              style={{
                // flex: 1,
                display: "flex",
                flexDirection: "row",
                gap: "1.5em",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                className="todo"
                style={{
                  padding: "1.5em",
                  maxWidth: "400px",
                  justifyContent: "center", // vertical inside box
                  alignItems: "center", // horizontal inside box
                  alignSelf: "center",
                  fontSize: "1.25em",
                }}
              >
                {" "}
                <div>
                  {" "}
                  <i className="small material-icons inline-icon">
                    launch
                  </i>{" "}
                </div>{" "}
                <div>
                  {" "}
                  Click on the <i className="fas fa-pen"></i> <b>EDIT</b> button
                  to experiment with the edition modes as depicted in the
                  pictures around{" "}
                </div>{" "}
              </div>{" "}
              <div
                style={{
                  fontSize: "1.5em",
                  color: "green",
                  display: "flex",
                  justifyContent: "flex-end", // pushes everything to the right
                  alignItems: "center", // vertical alignment
                  gap: "0.5em", // optional spacing between text and icon
                }}
              >
                {" "}
                <b>Single atom click</b>
                {"   "}
                <i
                  className="fas fa-arrow-circle-right"
                  style={{ fontSize: "2em", float: "right" }}
                />{" "}
              </div>{" "}
            </Box>{" "}
            <Box
              style={{
                //flex: 1,
                display: "flex",
                flexDirection: "row",
                gap: "1.5em",
                justifyContent: "space-between",
              }}
            >
              {" "}
              <div
                style={{
                  fontSize: "1.5em",
                  color: "green",
                  display: "flex",
                  justifyContent: "flex-end", // pushes everything to the right
                  alignItems: "center", // vertical alignment
                  gap: "0.5em", // optional spacing between text and icon
                }}
              >
                {" "}
                Direct bond click
                <i
                  className="fas fa-arrow-circle-down"
                  style={{ fontSize: "2em" }}
                />{" "}
                <b></b>{" "}
              </div>{" "}
              <div
                style={{
                  fontSize: "1.5em",
                  color: "green",
                  display: "flex",
                  justifyContent: "flex-end", // pushes everything to the right
                  alignItems: "center", // vertical alignment
                  gap: "0.5em", // optional spacing between text and icon
                }}
              >
                {" "}
                <b>Group links edition</b>{" "}
                <i
                  className="fas fa-arrow-circle-right"
                  style={{ fontSize: "2em", transform: "rotate(45deg)" }}
                />{" "}
              </div>{" "}
            </Box>{" "}
          </Box>{" "}
          {/* RIGHT SIDE (IMAGE) */}{" "}
          <Box
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {" "}
            <ImageMagnify
              src={martinizeSelect_1}
              alt="martinizeSelect_1"
              width={90}
              preWidth="600px"
            />{" "}
          </Box>{" "}
        </Box>
        <Box
          style={{
            paddingTop: "1em",
            //flex: 1,
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
          }}
        >
          <Box style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <ImageMagnify
              src={martinizeSelect_bond}
              preWidth="600px"
              alt="martinizeSelect_bond"
              width={90}
            />
          </Box>
          <Box style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <ImageMagnify
              src={martinizeElasticGroup}
              preWidth="600px"
              alt="martinizeElasticGroup"
              width={90}
            />
          </Box>
        </Box>
      </Box>
      <Box style={{ marginTop: "2em", textAlign: "justify" }}>
        <div
          className="info"
          style={{ maxWidth: "75%", padding: "1.5em", margin: "0 auto" }}
        >
          <i className="material-icons inline-icon">info_outline</i>
          Once your modifications are done, the{" "}
          <span className="MAD_logo">MAD:Molecule Builder</span> will ask for a
          confirmation before writing them to your history. Should you accept,
          the previous elastic model will be erased. Nothing prevents you from
          relaunching a Molecule Builder with the same file if you want to have
          different network states for the same molecule.
        </div>
      </Box>

      <Box style={{ marginTop: "3em" }}>
        <div id="go">
          <Typography variant="h4" gutterBottom>
            Protein with GO model
          </Typography>
        </div>
      </Box>

      <Box maxWidth={"80%"}>
        <div style={{ textAlign: "justify" }}>
          <Typography variant="body1" component="div">
            The same way as for Elastic network, you can generate martinize
            protein with Go bonds. The Go model approach implemented in Martini
            protein models have two main differences in relation to elastic
            network approaches: the type of potential function used and how the
            contact map is defined. For the potential function, instead of the
            harmonic potentials used in elastic approaches, the approach is
            based on a dissociative Lennard-Jones potential, which is placed on
            virtual sites built based on the position of the backbone beads (see
            the GROMAC manual for more
            <a href=" https://manual.gromacs.org/documentation/">
              {" "}
              details on virtual sites
            </a>{" "}
            ). The contact map in Go models are not necessarly only defined by
            distances cutoff between backbone beads and more sophisticated
            criterion can be employed. The implementation of Go models used with
            Martini is based on a contact map formed by the combination of the
            atomic overlap criterion (OV), a variant of the contact of structure
            units (CSU)[<a href="#references">1</a>] and a geometrical occlusion
            method. Independent of the contact map approach used, calibration of
            dissociation energies and cutoff based on experimental and/or
            atomistic simulation data are recommended.
          </Typography>
        </div>
      </Box>

      <Box
        style={{
          paddingTop: "2em",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "5em",
        }}
      >
        <Box
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1em",
          }}
        >
          <Box
            className="todo"
            style={{
              marginTop: "1em",
              marginBottom: "2em",
              minWidth: "290px",
            }}
          >
            <div>
              <i className="small material-icons inline-icon">launch</i>
            </div>
            <div>
              Go back to the MAD:Molecule Builder welcome screen and load T4
              Lysozyme protein file again. Select <b>Virtual Go sites</b>{" "}
              option, other options remaining as default.
            </div>
          </Box>
          <div
            className="info"
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "1em",
              alignItems: "center",
            }}
          >
            <div>
              <i className="material-icons inline-icon">info_outline</i>
            </div>
            <div>
              The representation of GO bonds is similar to elastic bonds. You
              can interact with bonds the same way by clicking to select one
              bond, one bead or an entiere group.
            </div>
          </div>
        </Box>
        <Box style={{ flex: 2 }}>
          <ImageMagnify
            src={martinize_GO_3}
            preWidth="400px"
            width={90}
            alt="martinize_GO_3"
          />
        </Box>
      </Box>

      <Box style={{ marginTop: "3em", marginBottom: "2em" }}>
        <div
          className="todo"
          style={{
            fontSize: "1.25em",
            padding: "1.5em",
            maxWidth: "800px", // or whatever width you want
            margin: "0 auto",
          }}
        >
          <div>
            <i className="small material-icons inline-icon">launch</i>
          </div>
          <div>
            We can select <b>group 21-22</b> and <b>group 141-142</b> to remove
            all bonds between them.
          </div>
        </div>
      </Box>

      <Box
        style={{
          paddingTop: "2em",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-around",
        }}
      >
        <Box style={{ flex: 2 }}>
          <ImageMagnify
            src={martinize_GO_2}
            preWidth="500px"
            alt="martinize_GO_2"
            width={90}
          />
        </Box>
        <Box style={{ flex: 1 }}>
          <div style={{ fontSize: "2em", alignSelf: "center" }}>
            <span className="fa-stack fa-2x">
              <i className="fa fa-circle fa-stack-2x icon-background"></i>
              <i className="fa fa-arrow-right fa-stack-1x icon-foreground"></i>
            </span>
          </div>
        </Box>
        <Box style={{ flex: 2 }}>
          <ImageMagnify
            src={martinize_GO_3}
            preWidth="500px"
            alt="martinize_GO_3"
            width={90}
          />
        </Box>
      </Box>
      <div id="disordered" style={{ marginTop: "4em" }}>
        <Typography variant="h4" gutterBottom>
          Defining disordered regions in the protein
        </Typography>
        <Typography variant="body1" component="div" style={{ maxWidth: "80%" }}>
          With the recent release of the Martini3-IDP for disordered protein
          regions, <span className="MAD_logo">MAD:Molecule Builder</span> has
          also been equipped with an interactive widget to guide the user in the
          definition of protein subsequences to be modeled as disordered.
        </Typography>
        <Box
          style={{
            marginTop: "4em",
            display: "flex",
            flexDirection: "row",
            gap: "5em",
          }}
        >
          <Box
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-evenly",
              gap: "3em",
            }}
          >
            <div
              className="todo"
              style={{
                fontSize: "1.25em",
                padding: "1.5em",
              }}
            >
              <div>
                <i className="small material-icons inline-icon">launch</i>
              </div>
              <div style={{ textAlign: "justify" }}>
                Change the forcefield selection to <b>martini3IDP</b>. You may
                then select specific protein regions to paremeterize as
                disordered regions.
              </div>
            </div>
            <div
              className="info"
              style={{
                display: "flex",
                gap: "1.5em",
                padding: "1.5em",
                fontSize: "1.25em",
                alignSelf: "flex-start",
                alignItems: "center",
              }}
            >
              <div>
                <i className="material-icons inline-icon">info_outline</i>
              </div>
              <div>
                The <b>martiniIDP</b> forcefield is also compatible with elastic
                and virtual Go-bonds modes, as Martini3001. You can then define
                the chain, start and stop points for the disordered region
              </div>
            </div>
          </Box>

          <Box style={{ flex: 2 }}>
            <ImageMagnify
              src={martini_IDP}
              alt="martini_IDP"
              preWidth="750px"
              width={90}
            />
          </Box>
        </Box>
      </div>

      <div id="history" style={{ marginTop: "4em" }}>
        <Typography variant="h4" gutterBottom>
          Browsing my molecular builds through history
        </Typography>
        <Box
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "2em",
            alignItems: "center",
          }}
        >
          <Typography
            variant="body1"
            component="div"
            style={{
              maxWidth: "80%",
              textAlign: "justify",
              alignSelf: "flex-start",
            }}
          >
            Click on <i className="fa fa-history"></i> <b>My builder history</b>{" "}
            in the left-end menu, to access to all your previous builds made
            with the <span className="MAD_logo">MAD:Molecule Builder</span>.
            Access an individual model to reload it for further editing or to
            download the result files. A detailed description of each build can
            be displayed by clicking on the down arrow.
          </Typography>

          <div>
            <img src={history_PNG} width="90%" />
          </div>

          <div
            className="info"
            style={{
              display: "flex",
              gap: "1.5em",
              padding: "1.5em",
              fontSize: "1.25em",
              alignSelf: "flex-start",
            }}
          >
            <div>
              <i className="material-icons inline-icon">info_outline</i>
            </div>
            <div>
              As any element of your history, the molecule will also be
              available into{" "}
              <span className="MAD_logo">MAD:System Builder</span> for its
              integration into larger system.
            </div>
          </div>
        </Box>
      </div>

      {/*


            <Box
              display="flex"
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
              style={{ gap: "5em" }}
            >
              <Box
                className="todo"
                style={{
                  marginTop: "1em",
                  marginBottom: "2em",
                  minWidth: "290px",
                }}
              >
                <div>
                  <i className="small material-icons inline-icon">launch</i>
                </div>
                <div>
                  Go back to the MAD:Molecule Builder welcome screen and load T4
                  Lysozyme protein file again. Select <b>Virtual Go sites</b>{" "}
                  option, other options remaining as default.
                </div>
              </Box>

              <Box>
                <img src={martinize_GO} width="550px" />
              </Box>
            </Box>
            <div style={{ gridColumn: "1 / 5" }}>
              <Typography variant="body1" gutterBottom>
                The representation of GO bonds is similar to elastic bonds. You
                can interact with bonds the same way by clicking to select one
                bond, one bead or an entiere group.
              </Typography>
            </div>
            <div style={{ gridColumn: "1 / 5", justifySelf: "center" }}>
              <div
                className="todo"
                style={{ marginTop: "2em", marginBottom: "0.5em" }}
              >
                <div>
                  <i className="small material-icons inline-icon">launch</i>
                </div>
                <div>
                  We can select <b>group 21-22</b> and <b>group 141-142</b> to
                  remove all bonds between them.
                </div>
              </div>
            </div>

            <div
              style={{ gridColumn: "1 / 5" }}
              className="go_delete_container"
            >
              <div style={{ gridColumn: "1 / 3" }}>
                <img src={martinize_GO_2} width="100%" />
              </div>
              <div
                style={{ fontSize: "2em", padding: "4px", alignSelf: "center" }}
              >
                <span className="fa-stack fa-2x">
                  <i className="fa fa-circle fa-stack-2x icon-background"></i>
                  <i className="fa fa-arrow-right fa-stack-1x icon-foreground"></i>
                </span>
              </div>
              <div style={{ gridColumn: "4 / 6" }}>
                <img src={martinize_GO_3} width="100%" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="history">
        <Typography variant="h4" gutterBottom>
          Browsing my molecular builds through history
        </Typography>
        <div className="history-container">
          <div>
            Click on <i className="fa fa-history"></i> <b>My builder history</b>{" "}
            in the left-end menu, to access to all your previous builds made
            with the <span className="MAD_logo">MAD:Molecule Builder</span>.
            Access an individual model to reload it for further editing or to
            download the result files. A detailed description of each build can
            be displayed by clicking on the down arrow.
          </div>
          <div style={{ gridColumn: "1 / 5" }}>
            <img src={history_PNG} width="100%" />
          </div>
          <div
            className="info"
            style={{ gridColumn: "1 / 5", display: "flex", gap: "1.5em" }}
          >
            <div>
              <i className="material-icons inline-icon">info_outline</i>
            </div>
            <div>
              As any element of your history, the molecule will also be
              available into{" "}
              <span className="MAD_logo">MAD:System Builder</span> for its
              integration into larger system.
            </div>
          </div>
        </div>
      </div>
      */}
      {/*  container end*/}
    </div>
  );
};
export default Molecule;
