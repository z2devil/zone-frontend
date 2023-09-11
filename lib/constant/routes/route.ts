interface IProps {
  path: string;
  name: string;
}

class RouteConfig {
  path: string;
  name: string;
  constructor({ path, name }: IProps) {
    this.path = path;
    this.name = name;
  }
}

export default RouteConfig;
