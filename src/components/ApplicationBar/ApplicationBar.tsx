import React from "react";
import AppBar from "@material-ui/core/AppBar";
import Divider from "@material-ui/core/Divider";
import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Typography from "@material-ui/core/Typography";
import {
  makeStyles,
  useTheme,
  Theme,
  createStyles,
} from "@material-ui/core/styles";
import { RouteComponentProps, Link } from "react-router-dom";
import { DrawerContentRouter } from "../Router";
import {
  Icon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  DialogContentText,
  ListItemAvatar,
  Avatar,
} from "@material-ui/core";
import Settings, { LoginStatus } from "../../Settings";
import { Badge } from "@material-ui/core";
import PersonIcon from "@material-ui/icons/Person";
import ApiHelper from "../../ApiHelper";
import { toast } from "../Toaster";
import { errorToText } from "../../helpers";
import Box from "@mui/system/Box";
import { WelcomeBar } from "./WelcomeBar";
//import { WarnBeta } from '../WarnBeta';

const drawerWidth = 240;

const logoBannerHeight = 80;

// This line needs to be set to zero value if no banner is to be displayed
// The WelcomeBar also needs to be commented out
const headerHeight = 125;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
    },
    drawer: {
      [theme.breakpoints.up("sm")]: {
        width: drawerWidth,
        flexShrink: 0,
      },
    },
    menuButton: {
      marginRight: theme.spacing(2),
      [theme.breakpoints.up("sm")]: {
        display: "none",
      },
    },
    appBar: {
      // The logo section, top banner
      zIndex: theme.zIndex.drawer + 1,
      backgroundColor: "#e4ebf2",
    },
    drawerPaper: {
      // The left panel
      //marginTop:'-75px',
      backgroundColor: "whitesmoke",
      width: drawerWidth,
      borderRight: "none",
      paddingTop: headerHeight + logoBannerHeight - 120,
    },
    noBannerDrawerPaper: {
      backgroundColor: "whitesmoke",
      width: drawerWidth,
      borderRight: "none",
      paddingTop: logoBannerHeight - 120,
    },
    content: {
      flexGrow: 1,
      marginTop: headerHeight + logoBannerHeight + 25,
    },
    noBannerContent: {
      flexGrow: 1,
      marginTop: logoBannerHeight + 75,
    },
    ppHeader: {},
  }),
);

interface DrawerElement {
  static?: boolean;
  path?: string;
  link?: boolean;
  icon?: string;
  text?: string;
  condition?: boolean;
  count?: Countable;
  font?:
    | number
    | "-moz-initial"
    | "inherit"
    | "initial"
    | "revert"
    | "unset"
    | "normal"
    | "bold"
    | "bolder"
    | "lighter";
  render?: () => JSX.Element;
  children?: React.ReactNode;
}

type Countable = "molecules" | "users";

function BadgedIcon(props: { icon: string | undefined; toCount: Countable }) {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    const request_url =
      props.toCount === "molecules" ? "moderation/list" : "user/list/waiting";
    ApiHelper.request(request_url)
      .then((answer) => {
        setCount(answer.length);
      })
      .catch((e) => {
        console.error(e);
        toast(errorToText(e));
      });
  }, []);

  return (
    <Badge overlap="rectangular" badgeContent={count} color="secondary">
      <Icon className={"fas fa-" + props.icon} />
    </Badge>
  );
}

function DrawerElements(props: RouteComponentProps) {
  const elements: DrawerElement[][] = [
    [
      {
        path: "/explore",
        link: true,
        icon: "compass",
        text: "Explore",
        font: "bold",
      },
      {
        path: "/builder",
        link: true,
        icon: "atom",
        text: "Molecule builder",
        //condition: !!Settings.logged,
        font: "bold",
      },
      {
        path: "/membrane_builder",
        link: true,
        icon: "virus",
        text: "System builder",
        //condition: !!Settings.logged,
        font: "bold",
      },
      {
        path: "/force_fields",
        link: true,
        icon: "download",
        text: "Force fields",
        font: "bold",
      },
      {
        path: "/polymer",
        link: true,
        icon: "draw-polygon",
        text: "Polymer Editor",
        //condition: Settings.logged === LoginStatus.Admin || Settings.logged === LoginStatus.Dev,
        font: "bold",
      },
      {
        path: "/tutorials",
        link: true,
        //static: true,
        icon: "graduation-cap",
        text: "Tutorials",
        font: "bold",
      },
    ],
    [
      {
        path: "/submissions",
        link: true,
        icon: "file-import",
        text: "My submitted models",
        condition: !!Settings.logged,
      },
      {
        path: "/history",
        link: true,
        icon: "history",
        text: "My jobs history",
        condition: !!Settings.logged,
      },
      {
        path: "/settings",
        link: true,
        icon: "cog",
        text: "Settings",
        condition: !!Settings.logged,
      },
      {
        path: "/moderation",
        link: true,
        icon: "inbox",
        text: `Moderation`,
        condition: Settings.logged === LoginStatus.Admin,
        count: "molecules",
      },
      {
        path: "/users",
        link: true,
        icon: "user",
        text: "Users",
        condition: Settings.logged === LoginStatus.Admin,
        count: "users",
      },
    ],
    [
      {
        render: LogOutDialog,
        condition: !!Settings.logged,
      },
      {
        path: "/login",
        link: true,
        icon: "sign-in-alt",
        text: "Login",
        condition: !Settings.logged,
      },
    ],
    [
      {
        path: "/contact",
        link: true,
        icon: "envelope",
        text: "Contact",
      },
      {
        path: "/citation",
        link: true,
        icon: "book",
        text: "Citation",
      },
    ],
  ];

  let compiled: JSX.Element[] = [];
  let i = 0;
  for (const list of elements) {
    const list_elements: JSX.Element[] = [];

    for (const e of list) {
      if (typeof e.condition === "boolean" && !e.condition) continue;

      if (e.render) {
        list_elements.push(<e.render key={i} />);
        i++;
        continue;
      }
      if (e.static) i++;
      list_elements.push(
        e.static ? (
          <a key={i - 1} style={{ all: "unset" }} href="/tutorial">
            <ListItem
              button
              key={i}
              selected={props.location.pathname === e.path}
              style={{ fontWeight: 600 }}
            >
              <ListItemIcon>
                <Icon
                  className={"fas fa-" + e.icon}
                  style={{ color: e.font ? "black" : "" }}
                />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography
                    style={{ fontWeight: e.font ? e.font : "normal" }}
                  >
                    {e.text}
                  </Typography>
                }
              />
            </ListItem>
          </a>
        ) : (
          <ListItem
            button
            key={i}
            component={e.link ? Link : "div"}
            to={e.path}
            selected={props.location.pathname === e.path}
            style={{ fontWeight: 600 }}
          >
            <ListItemIcon>
              {e.count ? (
                <BadgedIcon icon={e.icon} toCount={e.count} />
              ) : (
                <Icon
                  className={"fas fa-" + e.icon}
                  style={{ color: e.font ? "black" : "" }}
                />
              )}
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography style={{ fontWeight: e.font ? e.font : "normal" }}>
                  {e.text}
                </Typography>
              }
            />
          </ListItem>
        ),
      );
      i++;
    }

    if (list_elements.length) {
      compiled.push(...list_elements, <Divider key={i} />);
      i++;
    }
  }

  compiled.pop();

  return <React.Fragment>{compiled}</React.Fragment>;
}

export default function ApplicationDrawer(props: RouteComponentProps) {
  const classes = useStyles();
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const [hasBanner, setHasBanner] = React.useState(headerHeight > 0);
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <div style={{ marginTop: headerHeight, overflow: "auto" }}>
      {/*
      <div className={classes.toolbar} />
     */}
      {Settings.user && (
        <ListItem className={classes.ppHeader}>
          <ListItemAvatar>
            <Avatar>
              <PersonIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={Settings.user.name}
            secondary={Settings.user.role}
          />
        </ListItem>
      )}

      <DrawerElements {...props} />
    </div>
  );

  return (
    <div className={classes.root}>
      {/* App bar */}

      {/*
      <AppBar position="fixed" className={classes.appBar} elevation={0}>
        <Toolbar>
          <IconButton
            style={{ color: "red" }}
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            className={classes.menuButton}
          >

          <MenuIcon />
          </IconButton>
          <AppBarContent />

        </Toolbar>
      </AppBar>
      */}
      <AppBar component="header" className={classes.appBar} elevation={0}>
        <AppBarContent />
        <WelcomeBar
          maxHeight={headerHeight}
          onClose={() => setHasBanner(false)}
        />
      </AppBar>

      {/* Drawer */}
      <nav className={classes.drawer}>
        <Hidden smUp implementation="css">
          <Drawer
            variant="temporary"
            anchor={theme.direction === "rtl" ? "right" : "left"}
            open={mobileOpen}
            onClose={handleDrawerToggle}
            classes={{
              paper: hasBanner
                ? classes.drawerPaper
                : classes.noBannerDrawerPaper,
            }}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
          >
            {drawer}
          </Drawer>
        </Hidden>
        <Hidden xsDown implementation="css">
          <Drawer
            classes={{
              paper: hasBanner
                ? classes.drawerPaper
                : classes.noBannerDrawerPaper,
            }}
            variant="permanent"
            open
          >
            {drawer}
          </Drawer>
        </Hidden>
      </nav>

      {/* Main content */}
      <main className={hasBanner ? classes.content : classes.noBannerContent}>
        {/*     <TutorialShow />   */}
        <DrawerContentRouter {...props} />
      </main>
    </div>
  );
}

function AppBarContent() {
  const [title, setTitle] = React.useState("MArtini Database");

  function onTitleChange(e: CustomEvent<string>) {
    setTitle(e.detail);
  }

  React.useEffect(() => {
    // @ts-ignore
    window.addEventListener("app-bar.title-change", onTitleChange);

    return function () {
      // @ts-ignore
      window.removeEventListener("app-bar.title-change", onTitleChange);
    };
  }, []);

  return (
    // Just comment/uncomment WelcomeBar to show/hide
    <Box
      style={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
        flexDirection: "column",
        paddingRight: "0rem",
      }}
    >
      <img
        src="/assets/logo-large.png"
        alt="MAD LOGO"
        style={{ height: "110px", alignSelf: "center" }}
      />
      {/* <WelcomeBar />*/}
    </Box>
  );
}
function LogOutDialog() {
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <ListItem button onClick={() => setOpen(true)}>
        <ListItemIcon>
          <Icon className={"fas fa-sign-out-alt"} />
        </ListItemIcon>
        <ListItemText primary="Logout" />
      </ListItem>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Logout ?</DialogTitle>

        <DialogContent>
          <DialogContentText>
            You will be logged out and you must login again to see your
            submissions and send new molecules. Do you want to continue ?
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button color="primary" autoFocus onClick={() => setOpen(false)}>
            Close
          </Button>
          <Button
            color="secondary"
            onClick={async () => {
              await Settings.unlog();
              setOpen(false);
              window.location.pathname = "/";
            }}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
