import "./index.css";
import { SectionProps } from "./types";
import { Typography, Box } from "@material-ui/core";

const Intro = (props: SectionProps) => {
  return (
    <div className="welcome">
      <Box>
        <Typography variant="h2"> What is MAD ?</Typography>
      </Box>
      <Box
        style={{
          marginTop: "1em",
          marginBottom: "1em",
          maxWidth: "80%",
          textAlign: "justify",
          fontSize: "1.25em",
        }}
      >
        The Martini Database (MAD) is a web server dedicated to (a) sharing
        structures and topologies of molecules parameterized with the Martini
        coarse-grained (CG) force field [<a href="#references">1-3</a>]; (b)
        converting atomistic structures into CG structures; (c) preparing
        complex systems (including proteins, nucleic acids, lipids etc.) for
        molecular dynamics (MD) simulations at the CG level. Specifically, the
        MAD server currently includes tools to: (a) submit or retrieve CG
        representations of a wide range of molecules (lipids, sugars,
        nanoparticles, etc.); (b) transform all-atom protein structures into CG
        structures and topologies, with fine control on the process; (c)
        assemble biomolecules into large systems and deliver all files necessary
        to start molecular dynamics simulations.
      </Box>
      <Typography variant="body1">
        We will guide you during your first tour on the MAD server through the
        three following sections:
      </Typography>
      <div
        style={{
          paddingTop: "2em",
          display: "flex",
          flexDirection: "column",
          gap: "2em",
          fontSize: "1.5em",
        }}
      >
        <div
          className="cartouche"
          onClick={() => {
            props.onClick("database");
          }}
        >
          <b>MAD:Database</b> where you access/retrieve or submit to our
          database of compounds
        </div>

        <div
          className="cartouche"
          onClick={() => {
            props.onClick("molecule");
          }}
        >
          <b>MAD:Molecule Builder</b> where you coarse grain all atom PDB
          structure into their Martini versions
        </div>

        <div
          className="cartouche"
          onClick={() => {
            props.onClick("system");
          }}
        >
          <b>MAD:System Builder</b> which combines your coarse grained protein
          structure with lipid component from MAD database to create large
          system
        </div>

        <div
          className="cartouche"
          onClick={() => {
            props.onClick("polymer");
          }}
        >
          <b>MAD:Polymer Editor</b> where you design or transform molecules.
          Powered by polyply.
        </div>

        <div
          className="cartouche"
          onClick={() => {
            props.onClick("api");
          }}
        >
          <b>MAD:API</b> Download molecules in different formats.
        </div>

        <div
          className="disclaimer"
          style={{ display: "flex", width: "70%", marginLeft: "1em" }}
        >
          <div>
            <i className="fa fa-exclamation-triangle"></i>
          </div>
          <div>
            A registration is required in order to use the{" "}
            <b>MAD:Molecule Builder</b>, <b>MAD:Polymer Editor</b> and the
            <b>MAD:System Builder</b>
          </div>
        </div>

        <div
          className="todo"
          style={{
            display: "flex",
            width: "50%",
            marginLeft: "10%",
          }}
        >
          <div>
            <i className="fa fa-user-plus"></i>
          </div>
          <div>
            Account access and registration are available{" "}
            <a href="/login">here</a>
          </div>
        </div>

        {/*
        <div style={{ fontSize: "1.em" }} id="references">
          <h4>References</h4>
          <ol>
            <li>
              SJ Marrink, HJ Risselada, S Yefimov, DP Tieleman, AH De Vries. The
              MARTINI force field: coarse grained model for biomolecular
              simulations. J Phys Chem B (2007) 111, 7812-7824. Doi:
              10.1021/jp071097f
            </li>
            <li>
              L Monticelli, SK Kandasamy, X Periole, RG Larson, DP Tieleman, SJ
              Marrink. The MARTINI coarse-grained force field: extension to
              proteins. J Chem Theory Comput (2008) 4, 819-834. Doi:
              10.1021/ct700324x
            </li>
            <li>
              Souza, P.C.T., Alessandri, R., Barnoud, J. et al. Martini 3: a
              general-purpose force field for coarse-grained molecular
              dynamics. Nat Methods (2021) 18, 382–388. Doi :
              10.1038/s41592-021-01098-3
            </li>
          </ol>
        </div>

      */}
      </div>
    </div>
  );
};

export default Intro;
