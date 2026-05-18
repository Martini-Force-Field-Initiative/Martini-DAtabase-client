import "./index.css";
import { SectionProps } from "./types";
import menuSimple from "./images/database/menu_simple.png";
import databaseSearch from "./images/database/database_search.png";
import molCardOne from "./images/database/mol_card_1.png";
import molCardTwo from "./images/database/mol_card_2.png";
import { Typography, Box } from "@material-ui/core";
import { ImageMagnify } from "src/Shared";

const Database = (props: SectionProps) => {
  return (
    <div className="container">
      <Typography variant="h2">Database</Typography>
      <Typography
        variant="body1"
        component="div"
        style={{ marginTop: "2em", marginBottom: "1em" }}
      >
        The central part of the MAD ecosystem is a database molecular compounds
        available for coarse grain molecular dynamics with the (MARTINI)[
        <a href="#references">1,2,3</a>] force field. The molecules available in
        the <span className="MAD_logo">MAD:Database</span> cover a variety of
        biochemical natures across different versions of the MARTINI force
        field. The database curation process emphasis the qualitative
        descriptions of the force field version and parameters used during the
        coarse graining process that generated the molecules.
      </Typography>
      <div id="summary">
        <Typography variant="body1">
          In this tutorial you will learn about:
        </Typography>
        <Box style={{ marginBottom: "0.5em", marginTop: "1em" }}>
          {" "}
          <a href="#db_access"> 1. Accessing the database</a>{" "}
        </Box>
        <Box style={{ marginBottom: "0.5em" }}>
          {" "}
          <a href="#db_search"> 2. Searching the database for molecules</a>{" "}
        </Box>
        <Box style={{ marginBottom: "0.5em" }}>
          {" "}
          <a href="#search_interactions">
            {" "}
            3. Interactions in search results{" "}
          </a>{" "}
        </Box>
        <Box style={{ marginBottom: "0.5em" }}>
          {" "}
          <a href="#molecular_card">
            4. The content of the molecule card{" "}
          </a>{" "}
        </Box>
        <Box style={{ marginBottom: "0.5em" }}>
          <a href="#how_to_contribute">5. Contributing to the database</a>
        </Box>
      </div>
      <div className="todo" style={{ width: "75%", marginBottom: "2em" }}>
        <div>
          <i className="medium material-icons inline-icon">beenhere</i>
        </div>
        <div>
          No registration is required to access, search or download content from
          the <span className="MAD_logo">MAD:Database</span>
        </div>
      </div>

      <div id="db_access">
        <Box style={{ display: "flex", flexDirection: "row", gap: "4em" }}>
          <Box
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "2em",
            }}
          >
            <Typography variant="h4" component="div">
              Access the database
            </Typography>

            <div
              className="info"
              style={{ display: "flex", gap: "1em", width: "75%" }}
            >
              <div>
                <i className="material-icons inline-icon small">info_outline</i>
              </div>
              <div>
                By default, the database can be consulted by anyone. The access
                is located on the left-hand side panel of your browser window.
              </div>
            </div>

            <div className="todo" style={{ width: "75%" }}>
              <div>
                <i className="small material-icons inline-icon">launch</i>
              </div>
              <div>
                Just click on the{" "}
                <span style={{ fontWeight: "bolder" }}>
                  <i className="far fa-compass"></i> Explore
                </span>{" "}
                link
              </div>
            </div>
          </Box>
          <Box style={{ flex: 2 }}>
            <img src={menuSimple} style={{ height: "350px" }} />
          </Box>
        </Box>
      </div>

      <div id="db_search" style={{ marginTop: "3em" }}>
        <Typography variant="h4">Search the database for molecules</Typography>
        <Typography
          component="div"
          variant="body1"
          style={{ marginTop: "1.5em", marginBottom: "1.5em" }}
        >
          The top side of the database welcome screen is dedicated to search
          parameters.
        </Typography>

        <Box
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2em 4em", // row gap / column gap
          }}
        >
          {/* Headers */}
          <Typography variant="subtitle2" style={{ fontSize: "1.2em" }}>
            Select-like search criteria
          </Typography>
          <Typography variant="subtitle2" style={{ fontSize: "1.2em" }}>
            Free text search criteria
          </Typography>

          {/* Row 1 */}
          <div>
            <span className="li_supt">
              {" "}
              <i className="fas fa-arrow-right"></i> Force field:
            </span>{" "}
            Search for molecules with at least one coarse grain representation
            matching selected force field
          </div>
          <div>
            <span className="li_supt">
              {" "}
              <i className="fas fa-arrow-right"></i> Name:
            </span>{" "}
            Search for molecules with matching name field
          </div>

          {/* Row 2 */}
          <div>
            <span className="li_supt">
              {" "}
              <i className="fas fa-arrow-right"></i> Creation way:
            </span>{" "}
            Search for molecules with at least one coarse grain representation
            generated by the selected tool/procedure.
          </div>
          <div>
            <span className="li_supt">
              <i className="fas fa-arrow-right"></i> History:
            </span>{" "}
            Search for molecules with matching alias field.
          </div>

          {/* Row 3 */}
          <div>
            <span className="li_supt">
              {" "}
              <i className="fas fa-arrow-right"></i> Categories:
            </span>{" "}
            Search for molecule within the selected biochemical category
          </div>
          <div>
            <span className="li_supt">
              {" "}
              <i className="fas fa-arrow-right"></i> Upload:
            </span>{" "}
            Search for molecules with matching author description
          </div>
        </Box>
        {/*
        <Box style={{ display: "flex", flexDirection: "row", gap: "4em" }}>
          <div className="comment" style={{ flex: 1 }}>
            <Typography variant="subtitle2" style={{ fontSize: "1.2em" }}>
              {" "}
              Select-like search criteria
            </Typography>
            <ul className="show show_tab" style={{ listStyle: "none" }}>
              <li>
                <span className="li_supt">Force field</span> Search for
                molecules with at least one coarse grain representation matching
                selected force field
              </li>
              <li>
                <span className="li_supt">Creation way:</span> Search for
                molecules with at least one coarse grain representation
                generated by the selected tool/procedure
              </li>
              <li>
                <span className="li_supt">Categories:</span> Search for molecule
                within the selected biochemical category
              </li>
            </ul>
          </div>
          <div className="comment" style={{ flex: 1 }}>
            <Box>
              {" "}
              <Typography variant="subtitle2" style={{ fontSize: "1.2em" }}>
                Free text search criteria
              </Typography>
            </Box>
            <ul className="show show_tab" style={{ listStyle: "none" }}>
              <li>
                <span className="li_supt">Name</span> Search for molecules with
                matching name field.
              </li>
              <li>
                <span className="li_supt">History:</span> Search for molecules
                with matching alias field.
              </li>
              <li>
                <span className="li_supt">Upload:</span> Search for molecules
                with matching author description.
              </li>
            </ul>
          </div>
        </Box>
        */}
        <Box
          style={{
            display: "flex",
            flexDirection: "row",
            marginTop: "1.2em",
          }}
        >
          <Box>
            <img src={databaseSearch} width="750px" />
          </Box>
          <Box
            style={{
              justifyContent: "flex-start",
            }}
          >
            <div
              className="todo"
              style={{ width: "75%", marginTop: "1em", marginLeft: "15%" }}
            >
              <div>
                <i className="small material-icons inline-icon">launch</i>
              </div>
              <div>Enter DPG in the Alias search field</div>
            </div>
          </Box>
        </Box>
      </div>

      <div id="search_interactions" style={{ marginTop: "2em" }}>
        <Typography
          variant="h4"
          component="div"
          style={{ marginBottom: "0.25em" }}
        >
          Interactions in search results
        </Typography>
        <Typography variant="body1" component="div">
          As you are completing the search section, the table of molecule in the
          lower-half of the screen is refreshing to display the rows of
          molecules matching you search.
        </Typography>

        <div className="todo" style={{ width: "350px", marginTop: "1em" }}>
          <div>
            <i className="small material-icons inline-icon">launch</i>
          </div>
          <div>
            Click on the molecule named "<b>DPG3</b>"
          </div>
        </div>
      </div>

      <div id="molecular_card" style={{ marginTop: "2em" }}>
        <Typography variant="h4">The content of the molecule card</Typography>
        <Typography
          component="div"
          variant="body1"
          style={{ paddingTop: "1em", paddingBottom: "1em" }}
        >
          By default the <b>HEAD</b> version of a molecule is displayed. Most of
          the time, this corresponds to the latest deposited coarse grained
          representation of the molecule. The visualization screen of the
          molecular entry is divided into two parts.
        </Typography>

        <Box
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "2em",
          }}
        >
          <Box
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "1em",
            }}
          >
            <Box>
              <i className="material-icons inline-icon tiny">
                keyboard_arrow_right
              </i>
              The top level part displays the name and alias of the molecule
              along with the comments section of the molecule <i>itp</i> file.
              An interactive viewer featuring the same color code as the{" "}
              <span className="MAD_logo">MAD:Molecule Builder</span>
              allows for the visual inspection of the composition and
              configuration of the molecule.
            </Box>

            <Box>
              <ImageMagnify
                src={molCardOne}
                preWidth="750px"
                width={90}
                alt="molcardOne"
              />
            </Box>
          </Box>

          <Box
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "2em",
            }}
          >
            <Box>
              <i className="material-icons inline-icon tiny">
                keyboard_arrow_right
              </i>
              The lower part of the screen mentions publication details, the
              version tree and gives access to the download section.
            </Box>

            <Box>
              <ImageMagnify
                src={molCardTwo}
                preWidth="750px"
                width={90}
                alt="molCardTwo"
              />
            </Box>
            <div
              className="info"
              style={{ display: "flex", gap: "1em", alignItems: "center" }}
            >
              <div>
                <i className="material-icons inline-icon small">info_outline</i>
              </div>
              <div style={{ textAlign: "justify" }}>
                You can navigate in the version tree and access to all molecular
                card of its elements. Each element is a version of the same
                molecule with alternative an set of parameters or another
                force-field version. You can visit all our in store versions
                until you find the one matching your needs.
              </div>
            </div>
          </Box>
        </Box>
      </div>

      <div id="how_to_contribute" style={{ maxWidth: "90%" }}>
        <Typography
          component="div"
          variant="h4"
          style={{
            marginTop: "2em",
            marginBottom: "0.5em",
          }}
        >
          Contributing to the database
        </Typography>

        <Box
          className="info"
          style={{
            display: "flex",
            gap: "1em",
            fontSize: "1.25em",
            alignItems: "center",
          }}
        >
          <div>
            <i
              className="material-icons inline-icon small"
              style={{ fontSize: "3em" }}
            >
              file_upload
            </i>
          </div>
          <div style={{ textAlign: "justify" }}>
            You don't find your favorite molecule? Add it to the database!
            Contributions are welcome, we just ask you to register and you will
            be able to curate and upload the molecule of your choice. Your
            submission will be validated by our moderators prior to its addition
            to the database.
          </div>
        </Box>
      </div>
      {/*
        <div id="references" style={{ marginTop: "2em" }}>
          <Typography variant="h4">References</Typography>
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
              Souza, P.C.T., Alessandri, R., Barnoud, J. et al. Martini 3: a
              general-purpose force field for coarse-grained molecular
              dynamics. Nat Methods (2021) 18, 382–388. Doi :
              10.1038/s41592-021-01098-3
            </li>
          </ol>
        </div>
      */}
    </div>
  );
};

export default Database;
